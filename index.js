gsap.registerPlugin(ScrollTrigger)


/** button hover animation */
function initDirectionalButtonHover() {
    document.querySelectorAll('[data-btn-hover]').forEach(button => {
        button.addEventListener('mouseenter', handleHover);
        button.addEventListener('mouseleave', handleHover);
    });

    function handleHover(event) {
        const button = event.currentTarget;
        const buttonRect = button.getBoundingClientRect();

        // Get the button's dimensions and center
        const buttonWidth = buttonRect.width;
        const buttonHeight = buttonRect.height;
        const buttonCenterX = buttonRect.left + buttonWidth / 2;
        const buttonCenterY = buttonRect.top + buttonHeight / 2;

        // Calculate mouse position
        const mouseX = event.clientX;
        const mouseY = event.clientY;
        // Offset from the top-left corner in percentage
        const offsetXFromLeft = ((mouseX - buttonRect.left) / buttonWidth) * 100;
        const offsetYFromTop = ((mouseY - buttonRect.top) / buttonHeight) * 100;

        // Offset from the center in percentage
        let offsetXFromCenter = ((mouseX - buttonCenterX) / (buttonWidth / 2)) * 50;

        // Convert to absolute values
        offsetXFromCenter = Math.abs(offsetXFromCenter);

        // Update position and size of .btn__circle
        const circle = button.querySelector('.btn__circle');
        if (circle) {
            circle.style.left = `${offsetXFromLeft.toFixed(1)}%`;
            circle.style.top = `${offsetYFromTop.toFixed(1)}%`;
            circle.style.width = `${115 + offsetXFromCenter.toFixed(1) * 2}%`;
        }
    }
}

function initMarqueeScrollDirection() {
    document.querySelectorAll('[data-marquee-scroll-direction-target]').forEach((marquee) => {
      // Query marquee elements
      const marqueeContent = marquee.querySelector('[data-marquee-collection-target]');
      const marqueeScroll = marquee.querySelector('[data-marquee-scroll-target]');
      if (!marqueeContent || !marqueeScroll) return;
  
      // Get data attributes
      const { marqueeSpeed: speed, marqueeDirection: direction, marqueeDuplicate: duplicate, marqueeScrollSpeed: scrollSpeed } = marquee.dataset;
  
      // Convert data attributes to usable types
      const marqueeSpeedAttr = parseFloat(speed);
      const marqueeDirectionAttr = direction === 'right' ? 1 : -1; // 1 for right, -1 for left
      const duplicateAmount = parseInt(duplicate || 0);
      const scrollSpeedAttr = parseFloat(scrollSpeed);
      const speedMultiplier = window.innerWidth < 479 ? 0.25 : window.innerWidth < 991 ? 0.5 : 1;
  
      let marqueeSpeed = marqueeSpeedAttr * (marqueeContent.offsetWidth / window.innerWidth) * speedMultiplier;
  
      // Precompute styles for the scroll container
      marqueeScroll.style.marginLeft = `${scrollSpeedAttr * -1}%`;
      marqueeScroll.style.width = `${(scrollSpeedAttr * 2) + 100}%`;
  
      // Duplicate marquee content
      if (duplicateAmount > 0) {
        const fragment = document.createDocumentFragment();
        for (let i = 0; i < duplicateAmount; i++) {
          fragment.appendChild(marqueeContent.cloneNode(true));
        }
        marqueeScroll.appendChild(fragment);
      }
  
      // GSAP animation for marquee content
      const marqueeItems = marquee.querySelectorAll('[data-marquee-collection-target]');
      const animation = gsap.to(marqueeItems, {
        xPercent: -100, // Move completely out of view
        repeat: -1,
        duration: marqueeSpeed,
        ease: 'linear'
      }).totalProgress(0.5);
  
      // Initialize marquee in the correct direction
      gsap.set(marqueeItems, { xPercent: marqueeDirectionAttr === 1 ? 100 : -100 });
      animation.timeScale(marqueeDirectionAttr); // Set correct direction
      animation.play(); // Start animation immediately
  
      // Set initial marquee status
      marquee.setAttribute('data-marquee-status', 'normal');
  
      // ScrollTrigger logic for direction inversion
      ScrollTrigger.create({
        trigger: marquee,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (self) => {
          const isInverted = self.direction === 1; // Scrolling down
          const currentDirection = isInverted ? -marqueeDirectionAttr : marqueeDirectionAttr;
  
          // Update animation direction and marquee status
          animation.timeScale(currentDirection);
          marquee.setAttribute('data-marquee-status', isInverted ? 'normal' : 'inverted');
        }
      });
  
      // Extra speed effect on scroll
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: marquee,
          start: '0% 100%',
          end: '100% 0%',
          scrub: 0
        }
      });
  
      const scrollStart = marqueeDirectionAttr === -1 ? scrollSpeedAttr : -scrollSpeedAttr;
      const scrollEnd = -scrollStart;
  
      tl.fromTo(marqueeScroll, { x: `${scrollStart}vw` }, { x: `${scrollEnd}vw`, ease: 'none' });
    });
  }
  


/** line wipe animation */
const lineWipe = () => {
    $("[line-wipe]").each(function () {
        $(this).find('.line').append("<div class='line-mask'></div>")
        $(this).find('.line').each(function () {
            let triggerEl = $(this)
            let targetEl = $(this).find('.line-mask')

            let tl = gsap.timeline({
                scrollTrigger: {
                    trigger: triggerEl,
                    start: "top 90%",
                    end: "bottom 60%",
                    scrub: 1
                }
            })

            tl.to(targetEl, {
                width: "0%"
            })
        })
    })
}

/** line slide up animation */
const lineSlideUp = () => {
    $("[line-slide-up]").each(function (index) {
        let el = $(this).find('.line').wrap("<div class='line-block'></div>")
        let tl = gsap.timeline({ paused: true })
        tl.from(el, {
            yPercent: 100,
            duration: 0.65,
            ease: "power4.out",
            delay: 0.15,
            stagger: { amount: 0.1 }
        })

        ScrollTrigger.create({
            trigger: $(this),
            start: "top bottom",
            onLeaveBack: () => {
                tl.progress(0)
                tl.pause()
            }
        })

        ScrollTrigger.create({
            trigger: $(this),
            start: "top 90%",
            onEnter: () => {
                tl.play()
            }
        })
    })
}

let lineSplit
const splitLines = () => {
    lineSplit = new SplitType("[text-split]", {
        types: "lines, words"
    })
    lineWipe()
    lineSlideUp()
}

function adjustTextSize() {
    // Assuming the elements have the class 'dynamic-container' and 'dynamic-text'
    const dynamicContainers = document.querySelectorAll('[textContainer]');
    const dynamicTexts = document.querySelectorAll('[data-width=full]');

    dynamicContainers.forEach((dynamicContainer, index) => {
        const containerWidth = dynamicContainer.offsetWidth;
        const dynamicTextWidth = dynamicTexts[index].offsetWidth;

        const fontSize = (containerWidth / dynamicTextWidth) * parseFloat(window.getComputedStyle(dynamicTexts[index]).fontSize);

        dynamicTexts[index].style.fontSize = fontSize + 'px';
    });
}





window.addEventListener('DOMContentLoaded', () => {

    splitLines()
    adjustTextSize();
    initMarqueeScrollDirection();

    /** line break animation */
    $("[line-break]").each(function (index) {
        let tl = gsap.timeline({
            scrollTrigger: {
                trigger: $(this),
                start: "top bottom",
                end: "bottom 65%",
                scrub: 1
            }
        })
        tl.from($(this), {
            width: "0%"
        })
    })


    /** sticky section */
    $("[sticky-bottom]").each(function () {
        let tl = gsap.timeline({
            scrollTrigger: {
                trigger: $(this),
                start: "bottom bottom",
                end: "bottom top",
                scrub: 1,
                pin: true,
            }
        })
        tl.to($(this).children(), {
            scale: 0.9
        })
    })

    /** approach section text flip */
    $(".sticky_trigger").each(function (index) {
        index++
        let tl = gsap.timeline({
            scrollTrigger: {
                trigger: $(this),
                start: "top 50%",
                onEnter: () => {
                    tl.play()
                },
                onLeaveBack: () => {
                    tl.reverse()
                }
            }
        })
        tl.to($(".text_scroll_wrapper").find(".word"), {
            translateY: `${index * -100}%`,
            stagger: {
                amount: 0.2
            },
            duration: 0.3
        })
    })

    // Initialize Directional Button Hover
    initDirectionalButtonHover();

    /** lenis smooth scroll */
    const lenis = new Lenis({
        autoRaf: true,
    });

    // lenis.on('scroll', ScrollTrigger.update);
    // gsap.ticker.add((time) => { lenis.raf(time * 1000); });
    // gsap.ticker.lagSmoothing(0);
})

window.addEventListener('resize', () => {
    lineSplit.revert()
    splitLines()
    adjustTextSize();
})