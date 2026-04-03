// Exercise Database Service
import { exerciseDatabase } from '../data/exerciseDatabase';
import { ExerciseDatabaseEntry } from '../types';

class ExerciseDatabaseService {
  private exercises: ExerciseDatabaseEntry[] = exerciseDatabase;

  // Get all exercises
  getAllExercises(): ExerciseDatabaseEntry[] {
    return this.exercises;
  }

  // Get exercise count
  getExerciseCount(): number {
    return this.exercises.length;
  }

  // Get exercises by category
  getExercisesByCategory(category: string): ExerciseDatabaseEntry[] {
    if (category === 'all') return this.exercises;
    return this.exercises.filter(ex => ex.category.toLowerCase() === category.toLowerCase());
  }

  // Get exercises by muscle group
  getExercisesByMuscleGroup(muscleGroup: string): ExerciseDatabaseEntry[] {
    return this.exercises.filter(ex => ex.muscleGroup.toLowerCase() === muscleGroup.toLowerCase());
  }

  // Get exercises by equipment
  getExercisesByEquipment(equipment: string): ExerciseDatabaseEntry[] {
    return this.exercises.filter(ex => ex.equipment.toLowerCase() === equipment.toLowerCase());
  }

  // Get exercises by difficulty
  getExercisesByDifficulty(difficulty: string): ExerciseDatabaseEntry[] {
    return this.exercises.filter(ex => ex.difficulty.toLowerCase() === difficulty.toLowerCase());
  }

  // Fast search by name
  searchByName(query: string): ExerciseDatabaseEntry[] {
    if (!query.trim()) return this.exercises;
    
    const lowerQuery = query.toLowerCase();
    return this.exercises.filter(ex => 
      ex.name.toLowerCase().includes(lowerQuery) ||
      ex.muscleGroup.toLowerCase().includes(lowerQuery) ||
      ex.equipment.toLowerCase().includes(lowerQuery)
    );
  }

  // Advanced search
  advancedSearch(options: {
    query?: string;
    category?: string;
    muscleGroup?: string;
    equipment?: string;
    difficulty?: string;
  }): ExerciseDatabaseEntry[] {
    let results = this.exercises;

    // Filter by search query
    if (options.query?.trim()) {
      const lowerQuery = options.query.toLowerCase();
      results = results.filter(ex =>
        ex.name.toLowerCase().includes(lowerQuery) ||
        ex.muscleGroup.toLowerCase().includes(lowerQuery) ||
        ex.equipment.toLowerCase().includes(lowerQuery)
      );
    }

    // Filter by category
    if (options.category && options.category !== 'all') {
      results = results.filter(ex => ex.category.toLowerCase() === options.category.toLowerCase());
    }

    // Filter by muscle group
    if (options.muscleGroup?.trim()) {
      results = results.filter(ex => ex.muscleGroup.toLowerCase() === options.muscleGroup.toLowerCase());
    }

    // Filter by equipment
    if (options.equipment?.trim()) {
      results = results.filter(ex => ex.equipment.toLowerCase() === options.equipment.toLowerCase());
    }

    // Filter by difficulty
    if (options.difficulty?.trim()) {
      results = results.filter(ex => ex.difficulty.toLowerCase() === options.difficulty.toLowerCase());
    }

    return results;
  }

  // Get exercise by name
  getExerciseByName(name: string): ExerciseDatabaseEntry | null {
    return this.exercises.find(ex => ex.name.toLowerCase() === name.toLowerCase()) || null;
  }

  // Get exercise by ID
  getExerciseById(id: string): ExerciseDatabaseEntry | null {
    return this.exercises.find(ex => ex.id === id) || null;
  }

  // Get unique categories
  getCategories(): string[] {
    return Array.from(new Set(this.exercises.map(ex => ex.category))).sort();
  }

  // Get unique muscle groups
  getMuscleGroups(): string[] {
    return Array.from(new Set(this.exercises.map(ex => ex.muscleGroup))).sort();
  }

  // Get unique equipment types
  getEquipmentTypes(): string[] {
    return Array.from(new Set(this.exercises.map(ex => ex.equipment))).sort();
  }

  // Get unique difficulty levels
  getDifficultyLevels(): string[] {
    return ['beginner', 'intermediate', 'advanced'];
  }

  // Get suggested exercises (mix of popular ones)
  getSuggestedExercises(): ExerciseDatabaseEntry[] {
    const suggested: ExerciseDatabaseEntry[] = [];
    const categories = this.getCategories();
    
    // Add a few from each category
    for (const category of categories) {
      const categoryExercises = this.getExercisesByCategory(category).slice(0, 5);
      suggested.push(...categoryExercises);
    }
    
    return suggested;
  }

  // Add custom exercise (not stored in database, just in memory)
  addCustomExercise(exercise: Omit<ExerciseDatabaseEntry, 'id'>): ExerciseDatabaseEntry {
    const newExercise: ExerciseDatabaseEntry = {
      ...exercise,
      id: Date.now().toString()
    };
    
    this.exercises.push(newExercise);
    return newExercise;
  }
}

export const exerciseDatabaseService = new ExerciseDatabaseService();
export default exerciseDatabaseService;