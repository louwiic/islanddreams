// Setup GSAP centralisé — enregistre les plugins une seule fois
'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';

let registered = false;

export function registerGsapPlugins() {
  if (typeof window === 'undefined' || registered) return;
  gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);
  registered = true;
}

export { gsap, ScrollTrigger, MotionPathPlugin };
