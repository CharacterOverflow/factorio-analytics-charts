import {
    Dataset,
    DatasetFragment,
    DatasetSubset,
    Factory,
    IDatasetFilter,
    IGameDataItem,
    Logging,
    Trial
} from "factorio-analytics";

import {writeFile} from "fs/promises";
import {ChartConfiguration} from "chart.js";
import {ChartJSNodeCanvas} from "chartjs-node-canvas";
import * as fs from "fs-extra";
import * as path from "path";

export type TDataSetType = 'cons' | 'prod' | 'cons+prod';

// if no color is provided, we will generate a random one.
export interface IChartDataItemLabel extends IDatasetFilter {

    // Color to make the line itself. Accepts any RGBA, HSV, etc value that you would expect to work in CSS
    color?: string;

    // color to make the BACKGROUND under the line. useful to visualize area under a line. If left undefined, no fill is applied
    fillColor?: string;

    // the 'dashes' setting - MUST be array of length 2, indicating length of 'dash' and 'gap'
    dashes?: number[];

    // how wide to make the line
    width?: number;

    // the 'wigglyness' of the line. 0 is perfectly straight segments
    tension?: number;

    // How 'smooth' the data should be made. Uses moving average, specifies the 'smoothing window' size
    smooth?: number;

    // If no legend is specified, one is not shown on the chart!
    legend?: string;
}

// A config object to determine how to generate a chart from the game data
export interface IChartDataConfig {
    data: Dataset
    items: IChartDataItemLabel[]
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

/*
* This is used to draw a single line, from a sub-query of data.
* This is assumed that whatever query was used to  create 'dataset' produces a single record of data per tick, perfect for plotting
* */
export interface IChartDataset {
    // The fragment of data to use for plotting
    dataset: DatasetSubset;

    // Color to make the line itself. Accepts any RGBA, HSV, etc value that you would expect to work in CSS
    color?: string;

    // color to make the BACKGROUND under the line. useful to visualize area under a line. If left undefined, no fill is applied
    fillColor?: string;

    // the 'dashes' setting - MUST be array of length 2, indicating length of 'dash' and 'gap'
    dashes?: number[];

    // how wide to make the line
    width?: number;

    // the 'wigglyness' of the line. 0 is perfectly straight segments
    tension?: number;

    // How 'smooth' the data should be made. Uses moving average, specifies the 'smoothing window' size
    smooth?: number;

    // If no legend is specified, one is not shown on the chart!
    legend?: string;

}

export class ChartFactory extends Factory {

    static async generate(config: IChartConfig, data: IChartDataset[]) {
        Logging.log('info', {message: `Generating chart at ${config.filepath}...`, config: config});

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

        for (let dataset of data) {
            // Set variables not defined, if needed
            if (dataset.color == null) {
                dataset.color = `hsl(${Math.random() * 360}, 100%, 50%)`
            }
            if (!dataset.dataset.values || dataset.dataset.values?.length == 0) {
                dataset.dataset.load();
            }

            // Now... go about actually adding the config
            // we want anything 'consuming' to be negative, and production to be positive (if possible)
            // if the 'spec' is 'cons', we will invert the values before plotting.
            if (dataset.dataset.specifier == 'cons') {
                configuration.data.datasets.push({
                    label: dataset.legend ? dataset.legend : dataset.dataset.label,
                    data: ChartFactory.smoothData(dataset.dataset.values.map((d) => {
                        return {x: d.tick, y: -1 * d.value}
                    }), dataset.smooth),
                    showLine: true,
                    fill: !!dataset.fillColor,
                    backgroundColor: dataset.fillColor ? dataset.fillColor : `rgb(255, 255, 255)`,
                    borderColor: `${dataset.color}`,
                    borderWidth: dataset.width ? dataset.width : 2,
                    borderDash: dataset.dashes ? dataset.dashes : undefined,
                    pointRadius: 0,
                    tension: dataset.tension ? dataset.tension : .1,
                    spanGaps: true
                })
            } else {
                configuration.data.datasets.push({
                    label: dataset.legend ? dataset.legend : dataset.dataset.label,
                    data: ChartFactory.smoothData(dataset.dataset.values.map((d) => {
                        return {x: d.tick, y: d.value}
                    }), dataset.smooth),
                    showLine: true,
                    fill: !!dataset.fillColor,
                    backgroundColor: dataset.fillColor ? dataset.fillColor : `rgb(255, 255, 255)`,
                    borderColor: `${dataset.color}`,
                    borderWidth: dataset.width ? dataset.width : 2,
                    borderDash: dataset.dashes ? dataset.dashes : undefined,
                    pointRadius: 0,
                    tension: dataset.tension ? dataset.tension : .1,
                    spanGaps: true
                })
            }
        }

        // Now, we need to actually generate the chart
        // define all needed components for the overall chart before begin looping
        const chartJSNodeCanvas = new ChartJSNodeCanvas({
            width: config.xSize ? config.xSize : 1920,
            height: config.ySize ? config.ySize : 1080
        });

        Logging.log('info', `Rendering chart ${config.filepath} to ${config.filepath}...`);

        // Make sure the folder this is going into exists, recursively!
        await fs.mkdir(path.dirname(config.filepath), {recursive: true})

        const imageBuffer = await chartJSNodeCanvas.renderToBuffer(configuration);
        await writeFile(config.filepath, imageBuffer);
        Logging.log('info', `Chart ${config.chartTitle} generated!`);
        return config.filepath
    }
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
    // multiple configs are provided so that we can generate multiple charts overlaying each other

    static smoothData(data: IPlotData[], smooth: number): IPlotData[] {
        let smoothedData: IPlotData[] = [];
        if (smooth >= 1 && data.length >= smooth) {
            for (let i = 0; i < data.length - smooth + 1; i++) {
                const windowData = data.slice(i, i + smooth);

                const sum = windowData.reduce((acc, cur) => acc + cur.y, 0);
                const average = sum / smooth;

                smoothedData.push({
                    x: data[i + Math.floor(smooth / 2)].x,
                    y: average
                });
            }
            Logging.log('verbose', `Smoothed ${data.length} down to ${smoothedData.length}`)
        } else
            smoothedData = data;
        return smoothedData;
    }

}
