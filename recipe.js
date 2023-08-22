import { Rational, zero, one } from "./rational.js";
import { spec } from "./factory.js";

export class Ingredient
{
    constructor(item, amount)
    {
        this.item = item;
        this.amount = amount;
    }
}

class Recipe
{
    constructor(key, name, category, time, ingredients, product)
    {
        this.key = key;
        this.name = name;
        this.category = category;
        this.time = time;
        this.ingredients = ingredients;
        for (let ing of ingredients)
        {
            ing.item.addUse(this);
        }
        this.product = product;
        product.item.addRecipe(this);
    }
    gives(item)
    {
        if (this.product.item === item)
        {
            return this.product.amount;
        }
        return null;
    }
    iconPath()
    {
        return this.product.item.iconPath();
    }
}

function makeRecipe(data, items, d)
{
    let time = Rational.from_float(d.time);
    let [item_key, amount] = d.product;
    let item = items.get(item_key);
    let product = new Ingredient(item, Rational.from_float(amount));
    let ingredients = [];
    for (let [item_key, amount] of d.ingredients)
    {
        let item = items.get(item_key);
        ingredients.push(new Ingredient(item, Rational.from_float(amount)));
    }
    return new Recipe(d.key_name, d.name, d.category, time, ingredients, product);
}

class ResourceRecipe extends Recipe
{
    constructor(item, category)
    {
        super(item.key, item.name, category, zero, [], new Ingredient(item, one));
    }
}

export function getRecipes(data, items)
{
    let recipes = new Map();
    for (let d of data.resources)
    {
        let item = items.get(d.key_name);
        recipes.set(d.key_name, new ResourceRecipe(item, d.category));
    }
    for (let d of data.recipes)
    {
        recipes.set(d.key_name, makeRecipe(data, items, d));
    }
    for (let [itemKey, item] of items)
    {
        if (item.recipes.length === 0)
        {
            recipes.set(itemKey, new ResourceRecipe(item, null));
        }
    }
    return recipes;
}
