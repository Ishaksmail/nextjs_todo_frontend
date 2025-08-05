import { gsap } from "gsap"

// GSAP Animation Utilities
export const gsapUtils = {

  slideFadeToggle: (element: HTMLElement, show: boolean) => {
    if (show) {
      gsap.fromTo(element,
        { opacity: 0, height: 0 },
        {
          opacity: 1,
          height: "auto",
          duration: 0.4,
          ease: "power2.out"
        }
      )
    } else {
      gsap.to(element, {
        opacity: 0,
        height: 0,
        duration: 0.3,
        ease: "power2.in"
      })
    }
  },

  slideFadeReverseToggle: (element: HTMLElement, show: boolean) => {
    if (show) {
        gsap.fromTo(element,
            { opacity: 0, height: 0 },
            {
                opacity: 1,
                height: "auto",
                duration: 0.4,
                ease: "power2.out"
            }
        )
    } else {
        gsap.fromTo(element,
            { opacity: 1, height: "auto" },
            {
                opacity: 0,
                height: 0,
                duration: 0.3,
                ease: "power2.out"
            }
        )
    }
},


  // Page entrance animations
  pageEnter: (element: HTMLElement | string, delay = 0) => {
    gsap.fromTo(element,
      {
        opacity: 0,
        y: 30,
        scale: 0.95
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        delay,
        ease: "power2.out"
      }
    )
  },

  // Staggered animations for lists
  staggerIn: (elements: HTMLElement[] | string, delay = 0) => {
    gsap.fromTo(elements,
      {
        opacity: 0,
        y: 20,
        scale: 0.9
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.5,
        delay,
        stagger: 0.1,
        ease: "power2.out"
      }
    )
  },

  // Card hover animations
  cardHover: (element: HTMLElement) => {
    gsap.to(element, {
      y: -4,
      scale: 1.02,
      duration: 0.3,
      ease: "power2.out"
    })
  },

  cardHoverOut: (element: HTMLElement) => {
    gsap.to(element, {
      y: 0,
      scale: 1,
      duration: 0.3,
      ease: "power2.out"
    })
  },

  // Icon animations
  iconSpin: (element: HTMLElement) => {
    gsap.to(element, {
      rotation: 360,
      duration: 1,
      repeat: -1,
      ease: "none"
    })
  },

  iconHover: (element: HTMLElement) => {
    gsap.to(element, {
      scale: 1.1,
      rotation: 5,
      duration: 0.2,
      ease: "power2.out"
    })
  },

  iconHoverOut: (element: HTMLElement) => {
    gsap.to(element, {
      scale: 1,
      rotation: 0,
      duration: 0.2,
      ease: "power2.out"
    })
  },

  // Button animations
  buttonPress: (element: HTMLElement) => {
    gsap.to(element, {
      scale: 0.95,
      duration: 0.1,
      ease: "power2.out"
    })
  },

  buttonRelease: (element: HTMLElement) => {
    gsap.to(element, {
      scale: 1,
      duration: 0.1,
      ease: "power2.out"
    })
  },

  // Counter animation
  animateCounter: (element: HTMLElement, from: number, to: number, duration = 1) => {
    const obj = { value: from }
    gsap.to(obj, {
      value: to,
      duration,
      ease: "power2.out",
      onUpdate: () => {
        element.textContent = Math.round(obj.value).toString()
      }
    })
  },

  // Loading spinner
  loadingSpinner: (element: HTMLElement) => {
    gsap.to(element, {
      rotation: 360,
      duration: 1,
      repeat: -1,
      ease: "none"
    })
  },

  // Fade transitions
  fadeIn: (element: HTMLElement | string, delay = 0) => {
    gsap.fromTo(element,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 0.4,
        delay,
        ease: "power2.out"
      }
    )
  },

  fadeOut: (element: HTMLElement | string) => {
    gsap.to(element, {
      opacity: 0,
      duration: 0.3,
      ease: "power2.out"
    })
  }
}

