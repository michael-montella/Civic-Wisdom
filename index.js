/** publications swiper */
$(".slider-main_component").each(function () {
    const swiper = new Swiper($(this).find(".swiper")[0], {
        slidesPerView: '1',
        keyboard: true,
        spaceBetween: '4%',
        loop: true,
        slideActiveClass: 'is-active',
        slideDuplicateActiveClass: 'is-active',
        breakpoints: {
            // mobile landscape
            480: {
                slidesPerView: '1',
                spaceBetween: '4%'
            },
            // tablet
            768: {
                slidesPerView: '2',
                spaceBetween: '3%'
            },
            // desktop
            992: {
                slidesPerView: '4',
                spaceBetween: '2%'
            }
        },
        pagination: {
            el: $(this).find(".swiper-bullet-wrapper")[0],
            bulletActiveClass: "is-active",
            bulletClass: "swiper-bullet",
            bulletElement: "button",
            clickable: true,
        },
        navigation: {
            nextEl: $(this).find(".swiper-next")[0],
            prevEl: $(this).find(".swiper-prev")[0],
            disabledClass: "is-disabled"
        }
    })
})



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


/** marquee */
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


document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger, SplitText);

    document.querySelectorAll("[text-split]").forEach((text) => {
        console.log(text)
        const split = SplitText.create(text, {
            type: "words, chars",
            mask: "words",
            wordsClass: "word",
            charsClass: "char",
        })
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: text,
                start: "top bottom",
                end: "top 90%",
                toggleActions: "none play none reset",
            },
        })

        tl.from(split.words, {
            yPercent: 110,
            delay: 0.2,
            duration: 0.65,
            stagger: { amount: 0.1 },
            ease: "power2.out",
        })

        gsap.set(text, {autoAlpha: 1})
    })

    document.querySelectorAll("[spin-reveal]").forEach((el) => {
        gsap.from(el, {
            delay: 0.2,
            rotate: 90,
            scale: 0,
            duration: 1,
            ease: "power2.out",
        })

        gsap.set(el, { autoAlpha: 1 })
    })

    document.querySelectorAll("[line-wipe]").forEach((el) => {
        const split = SplitText.create(el, {
            type: "lines",
            linesClass: "line",
        })
        lineWipe()
    })

    initMarqueeScrollDirection();
    initDirectionalButtonHover();

    $(".about_marquee-advanced").each(function () {
        let tl = gsap.timeline({
            scrollTrigger: {
                trigger: $(this),
                start: "bottom bottom",
                end: "bottom top",
                scrub: 1,
                ease: "linear"
            }
        })
        tl.to($(this), {
            scale: 1.1
        })
    })

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

    /** svg animation */
    $("[svg-anim]").each(function () {
        ScrollTrigger.create({
            trigger: $(this),
            start: "top bottom",
            onEnter: () => {
                gsap.from($(this), {
                    scale: 0,
                    rotate: 90,
                    duration: 1,
                    ease: "power2.out"
                })
            }
        })
    })

})









/** lenis smooth scroll */
const lenis = new Lenis({
    autoRaf: true,
});


window.addEventListener('resize', () => {

})