import "./animation.js";
import {a as d, b as p} from "./carousel.js";
$(".hamburger").on("click", function() {
    $(this).toggleClass("active"),
    $("#drawer").slideToggle(300),
    $("nav.fixed").attr("aria-expanded", function(e, t) {
        return t == "true" ? "false" : "true"
    }),
    $("nav.fixed").toggleClass("active")
});
$(".dropdown").on("mouseenter", function() {
    $(this).find(".dropdown__content").stop(!0, !1).slideDown(300),
    $(this).attr("aria-expanded", "true")
}).on("mouseleave", function() {
    $(this).find(".dropdown__content").stop(!0, !1).slideUp(300),
    $(this).attr("aria-expanded", "false")
});
$(".click-dropdown").on("click", function() {
    $(this).find(".dropdown__content").slideToggle(300),
    $(this).find(".fa-chevron-down").toggleClass("rotate-180"),
    $(this).attr("aria-expanded", function(e, t) {
        return t == "true" ? "false" : "true"
    })
});
if (document.querySelector("#find-your-fit")) {
    const e = document.querySelector(".find-your-fit__slide")
      , t = {
        loop: !1,
        align: "start",
        watchDrag: !1
    }
      , o = EmblaCarousel(e, t);
    document.querySelectorAll(".find-your-fit__tab > button").forEach( (l, n) => {
        l.addEventListener("click", () => {
            o.scrollTo(n),
            $(l).addClass("active").siblings().removeClass("active")
        }
        )
    }
    )
}
if (document.querySelector("#total-rewards")) {
    const e = document.querySelector(".total-rewards__slide")
      , t = {
        loop: !0,
        align: "start"
    };
    EmblaCarousel(e, t, [EmblaCarouselAutoplay({
        playOnInit: !0,
        stopOnInteraction: !1,
        delay: 8e3
    })])
}
if (document.querySelector("#nursing-creers-showcase")) {
    const e = document.querySelector(".showcase__slide")
      , t = {
        loop: !0,
        align: "start"
    };
    EmblaCarousel(e, t, [EmblaCarouselAutoplay({
        playOnInit: !0,
        stopOnInteraction: !1,
        delay: 4e3
    })])
}
if (document.querySelectorAll(".continuously-carousel").length > 0) {
    const e = document.querySelector(".continuously-carousel")
      , t = [].slice.call(e.querySelectorAll(".continously-slider-wrapper"))
      , o = {
        loop: !0
    };
    t.map( (a, l) => {
        const n = l % 2 === 1 ? "backward" : "forward";
        return EmblaCarousel(a, o, [EmblaCarouselAutoScroll({
            playOnInit: !0,
            direction: n,
            startDelay: 0,
            delay: 1e3,
            stopOnMouseEnter: !0,
            stopOnInteraction: !1
        })])
    }
    )
}
if (document.querySelectorAll(".brand-carousel").length > 0) {
    const e = document.querySelector(".brand-carousel")
      , t = [].slice.call(e.querySelectorAll(".continously-slider-wrapper"))
      , o = {
        loop: !0
    };
    t.map( (a, l) => EmblaCarousel(a, o, [EmblaCarouselAutoScroll({
        playOnInit: !0,
        direction: "forward",
        startDelay: 0,
        delay: 1e3,
        stopOnMouseEnter: !0,
        stopOnInteraction: !1
    })]))
}
if (document.querySelector("#possibilities")) {
    let i = function() {
        r.time(0),
        r.play(),
        $(n).removeClass("playing")
    }
      , c = function() {
        r.pause(),
        $(n).addClass("playing")
    };
    const e = document.querySelector(".possibilities__slide")
      , t = {
        loop: !0,
        align: "center"
    }
      , o = EmblaCarousel(e, t, [EmblaCarouselAutoplay({
        playOnInit: !0,
        stopOnInteraction: !1,
        delay: 1e4
    })])
      , a = document.querySelector("#possibilities .possibility__prev")
      , l = document.querySelector("#possibilities .possibility__next")
      , n = document.querySelector("#possibilities .play-pause-button")
      , s = d(o, a, l);
    o.on("destroy", s);
    const r = gsap.timeline({
        repeat: -1
    });
    r.to("#possibilities .play-pause-button", {
        "--percent": "100%",
        duration: 10,
        ease: "none"
    });
    const u = p(o, n, i, c);
    o.on("destroy", u)
}
if (document.querySelector("#find-your-calling")) {
    const e = document.querySelector(".find-your-calling__slide")
      , t = {
        loop: !0,
        align: "start"
    }
      , o = EmblaCarousel(e, t)
      , a = document.querySelector("#find-your-calling .calling__prev")
      , l = document.querySelector("#find-your-calling .calling__next")
      , n = d(o, a, l);
    o.on("destroy", n)
}
if (document.querySelector("#cwpse")) {
    let i = function() {
        r.time(0),
        r.play(),
        $(n).removeClass("playing")
    }
      , c = function() {
        r.pause(),
        $(n).addClass("playing")
    };
    const e = document.querySelector(".cwpse__slide")
      , t = {
        loop: !0,
        align: "start"
    }
      , o = EmblaCarousel(e, t, [EmblaCarouselAutoplay({
        playOnInit: !0,
        stopOnInteraction: !1,
        delay: 8e3
    })])
      , a = document.querySelector("#cwpse .cwpse__prev")
      , l = document.querySelector("#cwpse .cwpse__next")
      , n = document.querySelector("#cwpse .play-pause-button")
      , s = d(o, a, l);
    o.on("destroy", s);
    const r = gsap.timeline({
        repeat: -1
    });
    r.to("#cwpse .play-pause-button", {
        "--percent": "100%",
        duration: 10,
        ease: "none"
    });
    const u = p(o, n, i, c);
    o.on("destroy", u)
}
if (document.querySelector("#featured-careers")) {
    const e = document.querySelector(".featured-careers__slide")
      , t = {
        loop: !0,
        align: "start"
    };
    EmblaCarousel(e, t, [EmblaCarouselAutoplay({
        playOnInit: !0,
        stopOnInteraction: !1,
        delay: 4e3,
        stopOnMouseEnter: !0
    })])
}
gsap.registerPlugin(ScrollTrigger);
document.querySelectorAll(".lazy-load-wrapper").forEach(e => {
    gsap.fromTo(e.querySelectorAll(".lazy-load-img"), {
        opacity: 0
    }, {
        opacity: 1,
        duration: .3,
        delay: .7,
        stagger: .2,
        scrollTrigger: {
            trigger: e,
            start: "top bottom-=20px",
            toggleActions: "play none none none",
            once: !0
        }
    }),
    gsap.fromTo(e.querySelectorAll(".u-img-reveal-bg"), {
        yPercent: 100
    }, {
        yPercent: 0,
        duration: .7,
        ease: "power3.in",
        stagger: .2,
        scrollTrigger: {
            trigger: e,
            start: "top bottom-=20px",
            toggleActions: "play none none none",
            once: !0
        }
    }),
    gsap.fromTo(e.querySelectorAll(".u-img-reveal-bg"), {
        zIndex: 1,
        opacity: 1
    }, {
        opacity: 0,
        zIndex: -1,
        delay: .7,
        stagger: .2,
        scrollTrigger: {
            trigger: e,
            start: "top bottom-=20px",
            toggleActions: "play none none none",
            once: !0
        }
    })
}
);
document.querySelectorAll(".lazy-wrapper") && document.querySelectorAll(".lazy-wrapper").forEach(t => {
    gsap.fromTo(t.querySelectorAll(".lazy-load"), {
        opacity: 0
    }, {
        opacity: 1,
        duration: .5,
        stagger: .2,
        delay: .7,
        scrollTrigger: {
            trigger: t,
            start: "top bottom",
            toggleActions: "play none none none",
            once: !0
        }
    })
}
);
if (document.getElementById("share-btn") && document.getElementById("share-overlay")) {
    const e = document.getElementById("share-btn")
      , t = document.getElementById("share-overlay");
    $(e).on("click", function() {
        $(t).slideToggle(300)
    })
}
function y(e) {
    const t = "https://www.facebook.com/sharer/sharer.php?u="
      , o = "https://twitter.com/intent/tweet?url="
      , a = "https://www.linkedin.com/sharing/share-offsite?url="
      , l = "mailto:?subject=Checkout%20This%20Job%20Opportunity&body=Hi%20there,%0D%0AI%20thought%20you%20might%20be%20interested%20in%20this%20job%20opportunity:%0D%0AAccount%20Executive%20Client%20Relationship%20Management%0D%0A"
      , n = ["facebook-btn", "twitter-btn", "linkedin-btn", "email-btn"];
    let s = e.target;
    if (s.tagName === "A" && n.includes(s == null ? void 0 : s.id)) {
        let r = window.location.href
          , i = "";
        switch (s.id) {
        case "facebook-btn":
            i = t + r;
            break;
        case "twitter-btn":
            i = o + r;
            break;
        case "linkedin-btn":
            i = a + r;
            break;
        case "email-btn":
            i = l + r;
            break
        }
        s.setAttribute("href", i)
    }
}
document.addEventListener("click", y);

const jobDescriptionInfo = document.querySelectorAll('.job-description--info');
jobDescriptionInfo.forEach( (info) => {
    const spans = info.querySelectorAll('.value');
    const hasText = Array.from(spans).some( (span) => span.innerText.trim().length > 0);
    if (!hasText) {
        info.style.display = 'none';
    }
}
);

if (document.querySelectorAll(".filter-click").length > 0) {
    function waitForElementToAppear(elementId, callback) {
        const targetNode = document.querySelector(".c-main-hero-search__location-content");
        // Or a more specific parent element if you know where it will be added
        const config = {
            childList: true,
            subtree: true
        };

        const observer = new MutationObserver( (mutationsList, observer) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    const element = document.getElementById(elementId);
                    if (element) {
                        observer.disconnect();
                        // Stop observing once the element is found
                        callback(element);
                        // Execute the callback with the found element
                        return;
                    }
                }
            }
        }
        );

        // Start observing the target node for configured mutations
        observer.observe(targetNode, config);

        // Also check if the element already exists in case it's present before the observer starts
        const initialElement = document.getElementById(elementId);
        if (initialElement) {
            observer.disconnect();
            callback(initialElement);
        }
    }
    document.querySelectorAll(".filter-click").forEach( (button) => {
        button.addEventListener("click", function() {
            let valueToType = this.innerText;
            const parent = this.parentElement;
            if (parent.id.startsWith("minnesota")) {
                valueToType = `${valueToType}, MN, USA`
            } else if (parent.id.startsWith("north")) {
                valueToType = `${valueToType}, ND, USA`
            } else if (parent.id.startsWith("wisconsin")) {
                valueToType = `${valueToType}, WI, USA`
            }
            setTimeout( () => {
                function setReactInputValue(inputElement, newValue) {
                    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;

                    nativeInputValueSetter.call(inputElement, newValue);

                    const event = new Event('input',{
                        bubbles: true
                    });
                    inputElement.dispatchEvent(event);
                }

                const input = document.querySelector('#location-search-input')
                setReactInputValue(input, valueToType);

                waitForElementToAppear("autocomplete-list", (element) => {
                    const firstChild = element.firstElementChild;
                    const event = new MouseEvent('click',{
                        view: window,
                        bubbles: true,
                        cancelable: true
                    });
                    firstChild.dispatchEvent(event);
                }
                )

                // const searchButton = document.querySelector(".c-main-hero-search__button-search")
                // searchButton.click();
            }
            , 10)
        })
    }
    )
}

// const allInputs = document.querySelector(".c-jobs-filter").querySelectorAll('input[type="checkbox"]');
// allInputs.forEach(input => {
//     if (input.checked) {
//         input.click();
//     }
// })
// const inputToClick = Array.from(allInputs).find(input => input.value === valueToClick);
// if (!inputToClick) {
//     const parent = this.parentElement;
//     if (parent.id.startsWith("minnesota")) {
//         Array.from(allInputs).find(input => input.value === "Minnesota").click();
//     }
//     else if (parent.id.startsWith("north")) {
//         Array.from(allInputs).find(input => input.value === "North Dakota").click();
//     }
//     else if (parent.id.startsWith("wisconsin")) {
//         Array.from(allInputs).find(input => input.value === "Wisconsin").click();
//     }
//     return
// };
// if (!inputToClick.checked) {
//     inputToClick.click();
// }
