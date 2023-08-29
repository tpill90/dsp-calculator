// Parses the url query params, so that the current settings can be reused and shared

import { DEFAULT_RATE, DEFAULT_RATE_PRECISION, DEFAULT_COUNT_PRECISION } from "./align.js";
import { DEFAULT_TAB, currentTab } from "./events.js";
import { spec, DEFAULT_BELT, DEFAULT_ASSEMBLER, DEFAULT_SMELTER } from "./factory.js";

export function formatSettings()
{
    let settings = "";
    if (currentTab !== DEFAULT_TAB)
    {
        settings += "tab=" + currentTab + "&";
    }
    if (spec.format.rateName !== DEFAULT_RATE)
    {
        settings += "rate=" + spec.format.rateName + "&";
    }
    if (spec.format.ratePrecision !== DEFAULT_RATE_PRECISION)
    {
        settings += "rp=" + spec.format.ratePrecision + "&";
    }
    if (spec.format.countPrecision !== DEFAULT_COUNT_PRECISION)
    {
        settings += "cp=" + spec.format.countPrecision + "&";
    }
    if (spec.belt.key !== DEFAULT_BELT)
    {
        settings += "belt=" + spec.belt.key + "&";
    }

    if (spec.assembler.key !== DEFAULT_ASSEMBLER)
    {
        settings += "assembler=" + spec.assembler.key + "&";
    }

    if (spec.smelter.key !== DEFAULT_SMELTER)
    {
        settings += "smelter=" + spec.smelter.key + "&";
    }

    settings += "items=";
    let targetStrings = [];
    for (let target of spec.buildTargets)
    {
        let targetString = "";
        if (target.changedBuilding)
        {
            targetString = `${target.itemKey}:f:${target.buildingInput.value}`;
        } else
        {
            targetString = `${target.itemKey}:r:${target.rate.mul(spec.format.rateFactor).toString()}`;
        }
        targetStrings.push(targetString);
    }
    settings += targetStrings.join(",");

    let ignore = [];
    for (let recipe of spec.ignore)
    {
        ignore.push(recipe.key);
    }
    if (ignore.length > 0)
    {
        settings += "&ignore=" + ignore.join(",");
    }

    let alt = [];
    for (let [item, recipe] of spec.altRecipes)
    {
        alt.push(recipe.key);
    }
    if (alt.length > 0)
    {
        settings += "&alt=" + alt.join(",");
    }

    return settings;
}

export function loadSettings(fragment)
{
    let settings = new Map();
    fragment = fragment.substr(1);
    let pairs = fragment.split("&");
    for (let pair of pairs)
    {
        let i = pair.indexOf("=");
        if (i === -1)
        {
            continue;
        }
        let name = pair.substr(0, i);
        let value = pair.substr(i + 1);
        settings.set(name, value);
    }
    return settings;
}
