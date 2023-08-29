import {getBelts} from "./belt.js"
import {getBuildings} from "./building.js"
import {spec} from "./factory.js"
import {loadSettings} from "./fragment.js"
import {getItems} from "./item.js"
import {getRecipes} from "./recipe.js"
import {renderSettings} from "./settings.js"
import {getAssemblers} from "./assembler.js";
import {getSmelters} from "./smelter.js";
import FactoryData from "./models/FactoryData.js"

function loadData(settings) 
{
    d3.json("data/data.json").then(function (data) 
    {
        let factoryData2 = new FactoryData(data);
        let items = getItems(data)
        let recipes = getRecipes(data, items)
        let buildings = getBuildings(factoryData2)
        let belts = getBelts(data)
        let assemblers = getAssemblers(data)
        let smelters = getSmelters(data)
        spec.setData(items, recipes, buildings, belts, assemblers, smelters)

        renderSettings(settings)

        spec.updateSolution()
    })
}

export function init() {
    let settings = loadSettings(window.location.hash)
    loadData(settings)
}
