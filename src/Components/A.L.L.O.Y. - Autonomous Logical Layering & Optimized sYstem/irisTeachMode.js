/**
 * I.R.I.S. Teach Mode System
 * ==========================
 * Tutorial mode with step-by-step guidance
 */

import {storage} from '../Storage/clientStorage.js';

export class TeachMode {
  constructor() {
    this.isActive = false;
    this.currentStep = 0;
    this.lessons = [];
    this.completedLessons = [];
    this.currentLesson = null;
  }

  /**
   * Start teach mode with lesson
   */
  startLesson(lesson) {
    this.isActive = true;
    this.currentStep = 0;
    this.currentLesson = lesson;

    return {
      success: true,
      message: lesson.title,
      steps: lesson.steps.length,
    };
  }

  /**
   * Get current step
   */
  getCurrentStep() {
    if (!this.currentLesson || this.currentStep >= this.currentLesson.steps.length) {
      return null;
    }

    return {
      step: this.currentStep,
      total: this.currentLesson.steps.length,
      content: this.currentLesson.steps[this.currentStep],
    };
  }

  /**
   * Next step
   */
  nextStep() {
    if (!this.currentLesson) {
      return {success: false, error: 'No lesson active'};
    }

    if (this.currentStep < this.currentLesson.steps.length - 1) {
      this.currentStep++;

      return {
        success: true,
        step: this.currentStep,
        content: this.currentLesson.steps[this.currentStep],
      };
    }

    return {success: false, error: 'Already at last step'};
  }

  /**
   * Previous step
   */
  previousStep() {
    if (this.currentStep > 0) {
      this.currentStep--;

      return {
        success: true,
        step: this.currentStep,
        content: this.currentLesson.steps[this.currentStep],
      };
    }

    return {success: false, error: 'Already at first step'};
  }

  /**
   * Complete lesson
   */
  completeLesson() {
    if (!this.currentLesson) {
      return {success: false};
    }

    const completion = {
      lessonId: this.currentLesson.id,
      title: this.currentLesson.title,
      completedAt: Date.now(),
      steps: this.currentLesson.steps.length,
    };

    this.completedLessons.push(completion);
    this.isActive = false;
    this.currentLesson = null;
    this.currentStep = 0;

    return {success: true, completed: this.currentLesson?.title};
  }

  /**
   * Exit teach mode
   */
  exit() {
    this.isActive = false;
    this.currentLesson = null;
    this.currentStep = 0;

    return {success: true};
  }

  /**
   * Get progress
   */
  getProgress() {
    return {
      isActive: this.isActive,
      currentStep: this.currentStep,
      totalSteps: this.currentLesson?.steps.length || 0,
      completedLessons: this.completedLessons.length,
      currentLessonTitle: this.currentLesson?.title || null,
    };
  }
}

const globalTeachMode = new TeachMode();

/**
 * Get global teach mode
 */
export function getTeachMode() {
  return globalTeachMode;
}

/**
 * Available lessons
 */
export const LESSONS = {
  DASHBOARD_BASICS: {
    id: 'dashboard-basics',
    title: 'Dashboard Basics',
    description: 'Learn how to navigate the Nexus dashboard',
    steps: [
      {
        title: 'Welcome',
        content: 'Welcome to Nexus! This tutorial will show you the basics.',
        action: 'info',
      },
      {
        title: 'Dashboard Overview',
        content: 'The dashboard displays your main widgets and information.',
        highlight: '.dashboard',
        action: 'info',
      },
      {
        title: 'Adding Widgets',
        content: 'Click the + button to add new widgets to your dashboard.',
        highlight: '.add-widget-button',
        action: 'await-click',
      },
      {
        title: 'Dashboard Complete',
        content: 'Congratulations! You completed the dashboard tutorial.',
        action: 'info',
      },
    ],
  },

  AI_INTEGRATION: {
    id: 'ai-integration',
    title: 'Using I.R.I.S. AI',
    description: 'Learn how to use the I.R.I.S. AI assistant',
    steps: [
      {
        title: 'AI Panel',
        content: 'The AI panel on the right side contains the I.R.I.S. assistant.',
        highlight: '.ai-panel',
        action: 'info',
      },
      {
        title: 'Asking Questions',
        content: 'Type a question or command in the input field and press Enter.',
        highlight: '.ai-input',
        action: 'info',
      },
      {
        title: 'Suggestions',
        content: 'I.R.I.S. will suggest relevant actions based on your query.',
        action: 'info',
      },
    ],
  },

  CUSTOMIZATION: {
    id: 'customization',
    title: 'Customizing Your Experience',
    description: 'Learn how to customize Nexus for your workflow',
    steps: [
      {
        title: 'Settings',
        content: 'Open Settings from the main menu to configure Nexus.',
        action: 'info',
      },
      {
        title: 'Appearance',
        content: 'Customize colors, fonts, and layout to your preference.',
        action: 'info',
      },
      {
        title: 'Preferences',
        content: 'Set AI providers, personality, and other preferences.',
        action: 'info',
      },
    ],
  },
};

/**
 * Start a lesson
 */
export function startLesson(lessonId) {
  const lesson = Object.values(LESSONS).find((l) => l.id === lessonId);

  if (!lesson) {
    return {success: false, error: 'Lesson not found'};
  }

  return globalTeachMode.startLesson(lesson);
}

/**
 * Get available lessons
 */
export function getAvailableLessons() {
  return Object.values(LESSONS).map((lesson) => ({
    id: lesson.id,
    title: lesson.title,
    description: lesson.description,
    steps: lesson.steps.length,
  }));
}

/**
 * Get completion status
 */
export function getCompletionStatus() {
  const completed = new Set(globalTeachMode.completedLessons.map((l) => l.lessonId));
  const total = Object.keys(LESSONS).length;

  return {
    completed: completed.size,
    total,
    percentage: Math.round((completed.size / total) * 100),
    lessons: Object.values(LESSONS).map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      completed: completed.has(lesson.id),
    })),
  };
}

/**
 * Save teach mode state
 */
export async function saveTeachModeState() {
  try {
    const settings = await storage.loadSettings();
    settings.teachModeState = {
      completedLessons: globalTeachMode.completedLessons,
      isActive: globalTeachMode.isActive,
    };
    await storage.saveSettings(settings);

    return {success: true};
  } catch (error) {
    console.error('Error saving teach mode state:', error);
    return {success: false, error: error.message};
  }
}
