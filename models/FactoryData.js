export default class FactoryData 
{
    constructor(jsonData) {
      this.belts = jsonData.belts || [];
      this.assemblers = jsonData.assemblers || [];
      this.smelters = jsonData.smelters || [];
      this.buildings = jsonData.buildings || [];
      this.miners = jsonData.miners || [];
      this.items = jsonData.items || [];
      this.recipes = jsonData.recipes || [];
      this.resources = jsonData.resources || [];
    }
  
    // Method to find a belt by key_name
    findBelt(key_name) {
      return this.belts.find(belt => belt.key_name === key_name);
    }
  
    // Method to find an assembler by key_name
    findAssembler(key_name) {
      return this.assemblers.find(assembler => assembler.key_name === key_name);
    }
  
    // Method to find a smelter by key_name
    findSmelter(key_name) {
      return this.smelters.find(smelter => smelter.key_name === key_name);
    }
  
    // Method to find a building by key_name
    findBuilding(key_name) {
      return this.buildings.find(building => building.key_name === key_name);
    }
  
    // Method to find a miner by key_name
    findMiner(key_name) {
      return this.miners.find(miner => miner.key_name === key_name);
    }
  
    // Method to find an item by key_name
    findItem(key_name) {
      return this.items.find(item => item.key_name === key_name);
    }
  
    // Method to find a recipe by key_name
    findRecipe(key_name) {
      return this.recipes.find(recipe => recipe.key_name === key_name);
    }
  
    // Method to find a resource by key_name
    findResource(key_name) {
      return this.resources.find(resource => resource.key_name === key_name);
    }
  }
  