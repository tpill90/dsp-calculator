//@ts-check
// eslint-disable-next-line no-unused-vars
import FactoryData from "./models/FactoryData.js";
import { Rational } from "./rational.js";

class Belt
{
    constructor(key, name, rate)
    {
        this.key = key;
        this.name = name;
        this.rate = rate;
    }
    iconPath()
    {
        return `images/${this.name}.png`;
    }
}

/**
 * 
 * @param { FactoryData } data 
 * @returns { Map<string,Belt> }
 */
export function getBelts(data)
{
    let belts = new Map();
    for (let belt of data.belts)
    {
        belts.set(belt.key_name, new Belt(belt.key_name, belt.name, Rational.from_float(belt.rate).div(Rational.from_float(60))));
    }
    return belts;
}
