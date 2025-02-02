import { Formatter } from "./align.js";
import { displayItems } from "./display.js";
import { formatSettings } from "./fragment.js";
import FactoryData from "./models/FactoryData.js";
import { zero } from "./rational.js";
import { BuildTarget } from "./target.js";
import { Totals } from "./totals.js";
import { renderTotals } from "./visualize.js";

const DEFAULT_ITEM_KEY = "iron_ingot";

export let DEFAULT_BELT = "belt3";
export let DEFAULT_ASSEMBLER = "assembler3";
export let DEFAULT_SMELTER = "smelter2";

class FactorySpecification
{
    constructor()
    {
        // Game data definitions
        this.items = null;
        this.recipes = null;
        this.buildings = new Map();
        this.belts = null;
        this.assemblers = null;
        this.smelters = null;

        this.itemTiers = [];

        this.buildTargets = [];


        // Map item to recipe
        this.altRecipes = new Map();

        this.belt = null;


        this.assembler = null;
        this.smelter = null;
        this.ignore = new Set();


        this.format = new Formatter();
    }

    setData(items, recipes, inputBuildings, belts, assemblers, smelters)
    {
        this.items = items;
        let tierMap = new Map();
        for (let [itemKey, item] of items)
        {
            let tier = tierMap.get(item.tier);
            if (tier === undefined)
            {
                tier = [];
                tierMap.set(item.tier, tier);
            }
            tier.push(item);
        }

        this.itemTiers = [];
        for (let [tier, tierItems] of tierMap)
        {
            if (tier != -1) this.itemTiers.push(tierItems);
        }
        this.itemTiers.sort((a, b) => a[0].tier - b[0].tier);
        
        this.recipes = recipes;

        for (let building of inputBuildings)
        {
            let category = this.buildings.get(building.category);
            if (category === undefined)
            {
                category = [];
                this.buildings.set(building.category, category);
            }
            category.push(building);
        }

        this.belts = belts;
        this.belt = belts.get(DEFAULT_BELT);

        this.assemblers = assemblers;
        this.smelters = smelters;
        this.assembler = assemblers.get(DEFAULT_ASSEMBLER);
        this.smelter = smelters.get(DEFAULT_SMELTER);

        debugger;
    }

    getRecipe(item)
    {
        // TODO: Alternate recipes.
        let recipe = this.altRecipes.get(item);
        if (recipe === undefined)
        {
            return item.recipes[0];
        } else
        {
            return recipe;
        }
    }

    setRecipe(recipe)
    {
        let item = recipe.product.item;
        if (recipe === item.recipes[0])
        {
            this.altRecipes.delete(item);
        } else
        {
            this.altRecipes.set(item, recipe);
        }
    }


    checkBuilding(category, searchKey, recipe)
    {
        let buildings = this.buildings.get(recipe.category);
        for (let index in buildings)
        {
            if (buildings[index].key === searchKey)
            {
                return buildings[index];
            }
        }
        return this.buildings.get(recipe.category)[0];
    }

    getBuilding(recipe)
    {
        if (recipe.category === null)
        {
            return null;
        }
        else if (recipe.category === "crafting")
        {
            return this.checkBuilding("crafting", this.assembler.key, recipe);
        } 
        else if (recipe.category === "smelting")
        {
            return this.checkBuilding("smelting", this.smelter.key, recipe);
        } 
        else
        {
            return this.buildings.get(recipe.category)[0];
        }
    }

    // Returns the recipe-rate at which a single building can produce a recipe.
    // Returns null for recipes that do not have a building.
    getRecipeRate(recipe)
    {
        let building = this.getBuilding(recipe);
        if (building === null)
        {
            return null;
        }
        return building.getRecipeRate(this, recipe);
    }

    getCount(recipe, rate)
    {
        let building = this.getBuilding(recipe);
        if (building === null)
        {
            return zero;
        }
        return building.getCount(this, recipe, rate);
    }

    getBeltCount(rate)
    {
        return rate.div(this.belt.rate);
    }

    getPowerUsage(recipe, rate)
    {
        let building = this.getBuilding(recipe);
        if (building === null || this.ignore.has(recipe))
        {
            return { average: zero, peak: zero };
        }
        let count = this.getCount(recipe, rate);
        let average = building.power.mul(count);
        let peak = building.power.mul(count.ceil());
        return { average, peak };
    }

    addTarget(itemKey)
    {
        if (itemKey === undefined)
        {
            itemKey = DEFAULT_ITEM_KEY;
        }
        let item = this.items.get(itemKey);
        let target = new BuildTarget(this.buildTargets.length, itemKey, item, this.itemTiers);
        this.buildTargets.push(target);
        d3.select("#targets").insert(() => target.element, "#plusButton");
        return target;
    }

    removeTarget(target)
    {
        this.buildTargets.splice(target.index, 1);
        for (let i = target.index; i < this.buildTargets.length; i++)
        {
            this.buildTargets[i].index--;
        }
        d3.select(target.element).remove();
    }

    toggleIgnore(recipe)
    {
        if (this.ignore.has(recipe))
        {
            this.ignore.delete(recipe);
        } else
        {
            this.ignore.add(recipe);
        }
    }

    solve()
    {
        let totals = new Totals();
        for (let target of this.buildTargets)
        {
            let subtotals = target.item.produce(this, target.getRate(), this.ignore);
            totals.combine(subtotals);
        }
        return totals;
    }

    setHash()
    {
        window.location.hash = "#" + formatSettings();
    }

    updateSolution()
    {
        let totals = this.solve();
        displayItems(this, totals, this.ignore);
        renderTotals(totals, this.buildTargets, this.ignore);
        this.setHash();
    }
}

export let spec = new FactorySpecification();
window.spec = spec;
