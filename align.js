import { Rational, one } from "./rational.js";

export const DEFAULT_RATE = "m";
export const DEFAULT_RATE_PRECISION = 3;
export const DEFAULT_COUNT_PRECISION = 1;

let seconds = one;
let minutes = Rational.from_float(60);
let hours = Rational.from_float(3600);

let displayRates = new Map([
    ["s", seconds],
    ["m", minutes],
    ["h", hours],
]);

export let longRateNames = new Map([
    ["s", "second"],
    ["m", "minute"],
    ["h", "hour"],
]);

export class Formatter
{
    constructor()
    {
        this.setDisplayRate(DEFAULT_RATE);
        this.displayFormat = "decimal";
        this.ratePrecision = DEFAULT_RATE_PRECISION;
        this.countPrecision = DEFAULT_COUNT_PRECISION;
    }

    setDisplayRate(rate)
    {
        this.rateName = rate;
        this.longRate = longRateNames.get(rate);
        this.rateFactor = displayRates.get(rate);
    }

    align(s, precision)
    {
        if (this.displayFormat === "rational")
        {
            return s;
        }

        let idx = s.indexOf(".");
        if (idx === -1)
        {
            idx = s.length;
        }

        let toAdd = precision - s.length + idx;
        if (precision > 0)
        {
            toAdd += 1;
        }
        while (toAdd > 0)
        {
            // s += "\u00A0";
            toAdd--;
        }
        return s;
    }

    rate(rate)
    {
        rate = rate.mul(this.rateFactor);
        if (this.displayFormat === "rational")
        {
            return rate.toMixed();
        } else
        {
            return rate.toDecimal(this.ratePrecision);
        }
    }

    alignRate(rate) 
    {
        let aligned = this.align(this.rate(rate), this.ratePrecision);
        return this.addCommasToNumber(aligned);
    }

    alignCount(count)
    {
        let aligned = this.align(this.count(count), this.countPrecision);
        return this.addCommasToNumber(aligned);
    }

    count(count)
    {
        if (this.displayFormat === "rational")
        {
            return count.toMixed();
        } else
        {
            return count.toUpDecimal(this.countPrecision);
        }
    }
       

    addCommasToNumber(number) 
    {
        // Convert the number to a string
        var numberString = number.toString();
        
        // Split the string into integer and decimal parts (if any)
        var parts = numberString.split(".");
        
        // Add commas to the integer part
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        
        // Join the integer and decimal parts (if any) and return
        return parts.join(".");
    }
}
