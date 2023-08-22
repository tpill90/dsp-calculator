import { zero } from "./rational.js";

export class Totals
{
    constructor()
    {
        this.rates = new Map();
        this.heights = new Map();
        this.topo = [];
    }

    add(recipe, rate)
    {
        this.topo.push(recipe);
        this.rates.set(recipe, (this.rates.get(recipe) || zero).add(rate));
    }

    updateHeight(recipe, height)
    {
        let knownHeight = this.heights.get(recipe);
        if (knownHeight === undefined || knownHeight < height)
        {
            this.heights.set(recipe, height);
        }
    }

    combine(other)
    {
        let newTopo = [];
        for (let recipe of this.topo)
        {
            if (!other.rates.has(recipe))
            {
                newTopo.push(recipe);
            }
        }
        newTopo = newTopo.concat(other.topo);
        for (let [recipe, rate] of other.rates)
        {
            this.add(recipe, rate);
        }
        this.topo = newTopo;
        for (let [recipe, height] of other.heights)
        {
            this.updateHeight(recipe, height + 1);
        }
    }
}
