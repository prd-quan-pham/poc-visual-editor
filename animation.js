gsap.registerPlugin(ScrollTrigger, CustomEase);
gsap.to("#navigation", {
    opacity: 1,
    scrollTrigger: {
        end: "max",
        toggleClass: {
            targets: "nav.fixed",
            className: "is-scrolled"
        },
        onLeave: function() {
            document.querySelector("nav.fixed").classList.add("is-scrolled")
        }
    }
});
document.querySelectorAll(".tally-up").forEach(t => {
    gsap.to(t, {
        textContent: t.attributes["data-value"].value,
        duration: 3,
        ease: "power1",
        snap: {
            textContent: t.attributes["data-value"].value % 1 !== 0 ? .1 : 1
        },
        stagger: {
            onUpdate: function() {
                this.targets()[0].innerHTML = e(this.targets()[0].textContent)
            }
        },
        scrollTrigger: {
            trigger: t,
            start: "top bottom-=20px",
            toggleActions: "play none none reset"
        }
    })
}
);
function e(t) {
    return t.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}
