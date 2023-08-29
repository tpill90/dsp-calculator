//@ts-check
// eslint-disable-next-line no-unused-vars
import FactoryData from "./models/FactoryData.js";
import { Rational } from "./rational.js";

class Building
{
    constructor(key, name, category, power, max, rate)
    {
        this.key = key;
        this.name = name;
        this.category = category;
        this.power = power;
        this.max = max;
        this.rate = Rational.from_float(rate);
    }

    getCount(spec, recipe, rate)
    {
        return rate.div(this.getRecipeRate(spec, recipe));
    }

    getRecipeRate(spec, recipe)
    {
        return recipe.time.reciprocate().mul(this.rate);
    }

    iconPath()
    {
        return `images/${this.name}.png`;
    }
}

class Miner extends Building
{
    constructor(key, name, category, power, baseRate)
    {
        super(key, name, category, power, null);
        this.baseRate = baseRate;
    }

    getRecipeRate(spec, recipe)
    {
        return this.baseRate;
    }
}

/**
 * 
 * @param {FactoryData} data 
 * @returns 
 */
export function getBuildings(data)
{
    let buildings = [];
    for (let d of data.buildings)
    {
        buildings.push(new Building(
            d.key_name,
            d.name,
            d.category,
            Rational.from_float(d.power),
            d.max,
            d.rate
        ));
    }
    for (let d of data.miners)
    {
        buildings.push(new Miner(
            d.key_name,
            d.name,
            d.category,
            Rational.from_float(d.power),
            Rational.from_float(d.base_rate).div(Rational.from_float(60)),
        ));
    }
    return buildings;
}
