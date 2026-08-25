import { cloneRecipe } from "../recipe/recipe";
import type { AdjustmentRecipe } from "../types/model";

export class RecipeHistory {
  private past: AdjustmentRecipe[] = [];
  private present: AdjustmentRecipe;
  private future: AdjustmentRecipe[] = [];

  constructor(initial: AdjustmentRecipe) {
    this.present = cloneRecipe(initial);
  }

  current(): AdjustmentRecipe {
    return cloneRecipe(this.present);
  }

  commit(next: AdjustmentRecipe): AdjustmentRecipe {
    if (JSON.stringify(next) === JSON.stringify(this.present)) return this.current();
    this.past.push(this.present);
    this.present = cloneRecipe(next);
    this.future = [];
    return this.current();
  }

  replace(next: AdjustmentRecipe): AdjustmentRecipe {
    this.present = cloneRecipe(next);
    return this.current();
  }

  undo(): AdjustmentRecipe {
    const previous = this.past.pop();
    if (!previous) return this.current();
    this.future.push(this.present);
    this.present = previous;
    return this.current();
  }

  redo(): AdjustmentRecipe {
    const next = this.future.pop();
    if (!next) return this.current();
    this.past.push(this.present);
    this.present = next;
    return this.current();
  }

  reset(neutral: AdjustmentRecipe): AdjustmentRecipe {
    return this.commit(neutral);
  }

  canUndo(): boolean {
    return this.past.length > 0;
  }

  canRedo(): boolean {
    return this.future.length > 0;
  }
}
