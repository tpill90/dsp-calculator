import { Totals } from "./totals.js";

export class Item
{
    constructor(key, name, tier)
    {
        this.key = key;
        this.name = name;
        this.tier = tier;
        this.recipes = [];
        this.uses = [];
    }

    addRecipe(recipe)
    {
        this.recipes.push(recipe);
    }

    addUse(recipe)
    {
        this.uses.push(recipe);
    }

    produce(spec, rate, ignore)
    {
        let totals = new Totals();
        let recipe = spec.getRecipe(this);
        let gives = recipe.gives(this);
        rate = rate.div(gives);

        totals.add(recipe, rate);
        totals.updateHeight(recipe, 0);
        if (ignore.has(recipe))
        {
            return totals;
        }
        for (let ing of recipe.ingredients)
        {
            let subtotals = ing.item.produce(spec, rate.mul(ing.amount), ignore);
            totals.combine(subtotals);
        }
        return totals;
    }

    iconPath()
    {
        return `images/${this.name}.png`;
    }
}

export function getItems(data)
{
    let items = new Map();
    for (let d of data.items)
    {
        items.set(d.key_name, new Item(d.key_name, d.name, d.tier));
    }
    return items;
}
