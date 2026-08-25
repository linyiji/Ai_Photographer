import type { AdjustmentRecipe } from "../types/model";
import { cloneRecipe } from "../recipe/recipe";

export class CompareState {
  private pressed = false;

  begin(recipe: AdjustmentRecipe): AdjustmentRecipe {
    this.pressed = true;
    return cloneRecipe(recipe);
  }

  end(recipe: AdjustmentRecipe): AdjustmentRecipe {
    this.pressed = false;
    return cloneRecipe(recipe);
  }

  isComparing(): boolean {
    return this.pressed;
  }
}
