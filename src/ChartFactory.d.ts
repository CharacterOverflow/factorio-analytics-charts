import { Dataset, DatasetSubset, Factory, IDatasetFilter } from "factorio-analytics";
export type TDataSetType = 'cons' | 'prod' | 'cons+prod';
export interface IChartDataItemLabel extends IDatasetFilter {
    color?: string;
    fillColor?: string;
    dashes?: number[];
    width?: number;
    tension?: number;
    smooth?: number;
    legend?: string;
}
export interface IChartDataConfig {
    data: Dataset;
    items: IChartDataItemLabel[];
}
export interface IChartConfig {
    chartTitle: string;
    filepath?: string;
    xSize?: number;
    ySize?: number;
}
export interface IPlotData {
    x: number;
    y: number;
}
export interface IChartDataset {
    dataset: DatasetSubset;
    color?: string;
    fillColor?: string;
    dashes?: number[];
    width?: number;
    tension?: number;
    smooth?: number;
    legend?: string;
}
export declare class ChartFactory extends Factory {
    static generate(config: IChartConfig, data: IChartDataset[]): Promise<string>;
    /**
        static generateChartComponents(config: IChartConfig, datasets: IChartDataConfig[]) {
            Logging.log('info', {message: `Generating chart at ${config.filepath}...`, config: config});
            /*
            * For each config, there are new data sources and trials to include in this. So, this is basically the old 'GeneerateChart' function,
            * but inside of an outer for loop before generating the final chart.
            *
            * Needs to build the datasets, along with modify configuration based on their needs
            *
            let configuration: ChartConfiguration = {
                type: 'line',
                data: {
                    datasets: []
                },
                options: {
                    layout: {
                        padding: {
                            left: 60,
                            bottom: 60
                        }
                    },
                    plugins: {
                        legend: {
                            display: true,
                            labels: {
                                font: {
                                    size: 30
                                },
                                filter: item => item.text !== 'none'
                            }
                        },
                        title: {
                            font: {
                                size: 40
                            },
                            display: true,
                            text: config.chartTitle,
                            padding: {
                                top: 10,
                                bottom: 30
                            }
                        }
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Ticks (60 per second)',
                                font: {
                                    size: 30
                                }
                            },
                            type: 'linear',
                            position: 'bottom',
                            ticks: {
                                font: {
                                    size: 20
                                }
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Item Count',
                                font: {
                                    size: 30
                                }
                            },
                            grid: {
                                color: 'rgba(0,0,0,0.53)',
                                drawTicks: false,
                            },
                            ticks: {
                                font: (context) => ({
                                    size: context.tick?.value === 0 ? 30 : 20,
                                    weight: context.tick?.value === 0 ? 'bold' : undefined
                                }),
                                callback: (value) => {
                                    return value
                                }
                            }
                        },
                    },
                },
                plugins: [{
                    id: 'customCanvasBackgroundColor',
                    beforeDraw: (chart, args, options) => {
                        const {ctx} = chart;
                        ctx.save();
                        ctx.globalCompositeOperation = 'destination-over';
                        ctx.fillStyle = '#ffffff';
                        ctx.fillRect(0, 0, chart.width, chart.height);
                        ctx.restore();
                    }
                }]
            }
    
            for (let dataset of datasets) {
                for (let item of dataset.items) {
                    // load needed data
                    let data = dataset.data.get(item);
    
                    // Set variables not defined, if needed
                    if (item.color == null) {
                        item.color = `hsl(${Math.random() * 360}, 100%, 50%)`
                    }
    
                    // We first need to determine if this is an ITEM in game, or a FIELD from performance data.
                    if (item.name == 'tick' || item.name == 'timestamp' || item.name == 'wholeUpdate' || item.name == 'latencyUpdate' ||
                        item.name == 'gameUpdate' || item.name == 'circuitNetworkUpdate' || item.name == 'transportLinesUpdate' ||
                        item.name == 'fluidsUpdate' || item.name == 'heatManagerUpdate' || item.name == 'entityUpdate' ||
                        item.name == 'particleUpdate' || item.name == 'mapGenerator' || item.name == 'mapGeneratorBasicTilesSupportCompute' ||
                        item.name == 'mapGeneratorBasicTilesSupportApply' || item.name == 'mapGeneratorCorrectedTilesPrepare' ||
                        item.name == 'mapGeneratorCorrectedTilesCompute' || item.name == 'mapGeneratorCorrectedTilesApply' ||
                        item.name == 'mapGeneratorVariations' || item.name == 'mapGeneratorEntitiesPrepare' ||
                        item.name == 'mapGeneratorEntitiesCompute' || item.name == 'mapGeneratorEntitiesApply' ||
                        item.name == 'crcComputation' || item.name == 'electricNetworkUpdate' || item.name == 'logisticManagerUpdate' ||
                        item.name == 'constructionManagerUpdate' || item.name == 'pathFinder' || item.name == 'trains' ||
                        item.name == 'trainPathFinder' || item.name == 'commander' || item.name == 'chartRefresh' ||
                        item.name == 'luaGarbageIncremental' || item.name == 'luaGarbageIncremental' || item.name == 'chartUpdate' ||
                        item.name == 'scriptUpdate') {
    
                        // We only define the y2 axis if it is needed for performance data
                        if (!configuration.options.scales['y2']) {
                            configuration.options.scales['y2'] = {
                                title: {
                                    display: true,
                                    text: 'ms per tick interval',
                                    font: {
                                        size: 30
                                    }
                                },
                                ticks: {
                                    font: {
                                        size: 20
                                    }
                                }
                            }
                        }
                        configuration.data.datasets.push({
                            label: item.legend ? item.legend : 'none',
                            data: ChartFactory.smoothData(dataset.trial.data.unifiedData.map((d) => {
                                return {x: d.tick, y: d[item.name]}
                            }), item.smooth),
                            showLine: true,
                            fill: !!item.fillColor,
                            backgroundColor: item.fillColor ? item.fillColor : `rgb(255, 255, 255)`,
                            borderColor: `${item.color}`,
                            borderDash: item.dashes ? item.dashes : undefined,
                            borderWidth: item.width ? item.width : 2,
                            pointRadius: 0,
                            tension: item.tension ? item.tension : .1,
                            yAxisID: 'y2'
                        })
    
                    } else if (item.set == 'cons+prod') {
                        // If we want both consumption and production, there are 2 datasets. But we will only show 1 label!
                        // the 'consumption' dataset is by default negative
                        configuration.data.datasets.push({
                            label: `none`,
                            data: ChartFactory.smoothData(data.filter((d) => {
                                return d.prod > 0 && d.label === item.name
                            }).map((d) => {
                                return {x: d.tick, y: d.prod}
                            }), item.smooth),
                            showLine: true,
                            fill: !!item.fillColor,
                            backgroundColor: item.fillColor ? item.fillColor : `rgb(255, 255, 255)`,
                            borderColor: `${item.color}`,
                            borderWidth: item.width ? item.width : 2,
                            borderDash: item.dashes ? item.dashes : undefined,
                            pointRadius: 0,
                            tension: item.tension ? item.tension : .1,
                            spanGaps: true
                        })
    
                        configuration.data.datasets.push({
                            label: item.legend ? item.legend : 'none',
                            data: ChartFactory.smoothData(data.filter((d) => {
                                return d.cons > 0 && d.label === item.name
                            }).map((d) => {
                                return {x: d.tick, y: d.cons != 0 ? d.cons * -1 : 0}
                            }), item.smooth),
                            showLine: true,
                            fill: !!item.fillColor,
                            backgroundColor: item.fillColor ? item.fillColor : `rgb(255, 255, 255)`,
                            borderColor: `${item.color}`,
                            borderWidth: item.width ? item.width : 2,
                            borderDash: item.dashes ? item.dashes : undefined,
                            pointRadius: 0,
                            tension: item.tension ? item.tension : .1,
                            spanGaps: true
                        })
                    } else if (item.set == 'cons') {
                        configuration.data.datasets.push({
                            label: item.legend ? item.legend : 'none',
                            data: ChartFactory.smoothData(data.filter((d) => {
                                return d.cons > 0 && d.label === item.name
                            }).map((d) => {
                                return {x: d.tick, y: d.cons != 0 ? d.cons * -1 : 0}
                            }), item.smooth),
                            showLine: true,
                            fill: !!item.fillColor,
                            backgroundColor: item.fillColor ? item.fillColor : `rgb(255, 255, 255)`,
                            borderColor: `${item.color}`,
                            borderWidth: item.width ? item.width : 2,
                            borderDash: item.dashes ? item.dashes : undefined,
                            pointRadius: 0,
                            tension: item.tension ? item.tension : .1,
                            spanGaps: true
                        })
                    } else if (item.set == 'prod') {
                        // it doesn't matter what value 'prod' is - if useCons is false and we hit this, it means that produced needs to be used
                        configuration.data.datasets.push({
                            label: item.legend ? item.legend : 'none',
                            data: ChartFactory.smoothData(data.filter((d) => {
                                return d.prod > 0 && d.label === item.name
                            }).map((d) => {
                                return {x: d.tick, y: d.prod}
                            }), item.smooth),
                            showLine: true,
                            fill: !!item.fillColor,
                            backgroundColor: item.fillColor ? item.fillColor : `rgb(255, 255, 255)`,
                            borderColor: `${item.color}`,
                            borderWidth: item.width ? item.width : 2,
                            borderDash: item.dashes ? item.dashes : undefined,
                            pointRadius: 0,
                            tension: item.tension ? item.tension : .1,
                            spanGaps: true
                        })
                    } else
                        throw new Error('Invalid set type for chart item. Must be "cons", "prod", or "cons+prod"');
                }
            }
    
            return configuration;
    
        }
    */
    static smoothData(data: IPlotData[], smooth: number): IPlotData[];
}
