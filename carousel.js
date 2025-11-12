const d = (t, e, s) => {
    const o = () => {
        t.canScrollPrev() ? e.removeAttribute("disabled") : e.setAttribute("disabled", "disabled"),
        t.canScrollNext() ? s.removeAttribute("disabled") : s.setAttribute("disabled", "disabled")
    }
    ;
    return t.on("select", o).on("init", o).on("reInit", o),
    () => {
        e.removeAttribute("disabled"),
        s.removeAttribute("disabled")
    }
}
  , u = (t, e, s) => {
    const o = () => {
        t.scrollPrev()
    }
      , r = () => {
        t.scrollNext()
    }
    ;
    e.addEventListener("click", o, !1),
    s.addEventListener("click", r, !1);
    const n = d(t, e, s);
    return () => {
        n(),
        e.removeEventListener("click", o, !1),
        s.removeEventListener("click", r, !1)
    }
}
  , v = (t, e, s, o) => {
    const r = l => {
        var i;
        const c = (i = l == null ? void 0 : l.plugins()) == null ? void 0 : i.autoplay;
        if (!c)
            return;
        (c.isPlaying() ? o : s)()
    }
      , n = () => {
        var a;
        const l = (a = t == null ? void 0 : t.plugins()) == null ? void 0 : a.autoplay;
        if (!l)
            return;
        (l.isPlaying() ? l.stop : l.play)()
    }
    ;
    return e.addEventListener("click", n),
    t.on("autoplay:play", r).on("autoplay:stop", r),
    () => {
        e.removeEventListener("click", n),
        t.off("autoplay:play", r).off("autoplay:stop", r)
    }
}
;
export {u as a, v as b};
