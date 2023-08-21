// This file handles displaying the results on the "Items" tab

import { toggleIgnoreHandler } from "./events.js";
import { spec } from "./factory.js";
import { Rational, zero, one } from "./rational.js";

class Header
{
    constructor(text, colspan)
    {
        this.text = text;
        this.colspan = colspan;
    }
}

function changeOverclock(d)
{
    let hundred = Rational.from_float(100);
    let twoFifty = Rational.from_float(250);
    let x = Rational.from_string(this.value).floor();
    if (x.less(one))
    {
        x = one;
    }
    if (twoFifty.less(x))
    {
        x = twoFifty;
    }
    x = x.div(hundred);
    spec.setOverclock(d.recipe, x);
    spec.updateSolution();
}

// Remember these values from update to update, to make it simpler to reuse elements.
let displayedItems = [];

export function displayItems(spec, totals, ignore)
{
    displayedItems = displayedItems.slice(0, totals.topo.length);
    while (displayedItems.length < totals.topo.length)
    {
        displayedItems.push({});
    }

    let totalAveragePower = zero;
    let totalPeakPower = zero;
    let powerShardsUsed = 0;
    for (let i = 0; i < totals.topo.length; i++)
    {
        let recipe = totals.topo[i];
        let display = displayedItems[i];
        let rate = totals.rates.get(recipe);
        
        
        let overclock = spec.getOverclock(recipe);
        let overclockString = overclock.mul(Rational.from_float(100)).toString();
        
        let { average, peak } = spec.getPowerUsage(recipe, rate, totals.topo.length);
        totalAveragePower = totalAveragePower.add(average);
        totalPeakPower = totalPeakPower.add(peak);

        let item = recipe.product.item;
        display.item = item;

        let itemRate = rate.mul(recipe.gives(item));
        display.itemRate = itemRate;

        display.recipe = recipe;
        display.ignore = ignore.has(recipe);
        display.rate = rate;
        display.building = spec.getBuilding(recipe);
        display.count = spec.getCount(recipe, rate);

        //TODO is this used?
        display.overclock = overclockString;
        display.powerShardCount = display.ignore ? 0 : Math.ceil(Math.max(overclock.toFloat() - 1, 0) / 0.5);
        powerShardsUsed += display.powerShardCount;

        display.average = average;

        //TODO is this used?
        display.peak = peak;
    }

    BuildTableHtml(spec, powerShardsUsed, totalAveragePower, totalPeakPower);
}

function BuildTableHtml(spec, powerShardsUsed, totalAveragePower, totalPeakPower)
{
    let headers = [
        new Header("items/" + spec.format.rateName, 1),
        new Header("buildings", 2),
        new Header("overclock", powerShardsUsed ? 3 : 1),
        new Header("power", 1),
    ];
    let totalCols = 0;
    for (let header of headers)
    {
        totalCols += header.colspan;
    }

    let table = d3.select("table#totals");

    let headerRow = table.selectAll("thead tr")
                         .selectAll("th")
                         .data(headers);
    headerRow.exit().remove();
    headerRow.join("th")
        .text(d => d.text)
        .attr("colspan", d => d.colspan);

    // create missing rows
    let rows = table.selectAll("tbody")
                    .selectAll("tr")
                    .data(displayedItems);
    rows.exit().remove();
    let row = rows.enter()
        .append("tr")
        .classed("display-row", true);

    // items/m
    let itemCell = row.append("td");

    itemCell.append("img")
            .classed("icon item-icon", true)
            .attr("width", 32)
            .attr("height", 32)
            .on("click", toggleIgnoreHandler);
            
    itemCell.append("tt")
            .classed("item-rate", true);

    // buildings
    let buildingCell = row.append("td")
        .classed("pad building", true);


    buildingCell.append("img")
        .classed("icon building-icon", true)
        .attr("width", 32)
        .attr("height", 32);
    buildingCell.append(d => new Text(" \u00d7"));
    row.append("td")
        .classed("right-align building", true)
        .append("tt")
        .classed("building-count", true);

    // overclock
    let overclockCell = row.append("td")
        .classed("pad building overclock", true);
    overclockCell.append("input")
        .classed("overclock", true)
        .attr("type", "number")
        .attr("title", "")
        .attr("min", 1)
        .attr("max", 250)
        .on("input", changeOverclock);
    overclockCell.append(() => new Text("%"));

    // power
    row.append("td")
        .classed("right-align pad building", true)
        .append("tt")
        .classed("power", true);

    // update rows
    row = table.select("tbody")
               .selectAll("tr")
               .classed("nobuilding", d => d.building === null);

    // Writing item values 
    row.selectAll("img.item-icon")
        .classed("ignore", d => d.ignore)
        .attr("src", d => d.item.iconPath())
        .attr("title", "Click to ignore");

    row.selectAll("tt.item-rate")
       .text(d => spec.format.alignRate(d.itemRate));
        
    let buildingRow = row.filter(d => d.building !== null);
    buildingRow.selectAll("img.building-icon")
        .attr("src", d => d.building.iconPath())
        .attr("title", d => d.building.name);
    buildingRow.selectAll("tt.building-count")
        .text(d => spec.format.alignCount(d.count));
    buildingRow.selectAll("input.overclock")
        .attr("value", d => d.overclock);

    buildingRow.selectAll("tt.power")
        .text(d => spec.format.alignCount(d.average) + " MW");
    buildingRow.selectAll(".building")
        .classed("hide-building", d => d.ignore);

    let totalPower = [totalAveragePower, totalPeakPower];
    let footerPowerRow = table.selectAll("tfoot tr.power");
    footerPowerRow.select("td.label")
        .attr("colspan", totalCols - 1);
    footerPowerRow.select("tt")
        .data(totalPower)
        .text(d => spec.format.alignCount(d) + " MW");

    let footerPowerShardRow = table.select("tfoot tr.power-shard");
    footerPowerShardRow.select("td.label").attr("colspan", totalCols - 1);
    footerPowerShardRow.select("tt").text(powerShardsUsed);
}