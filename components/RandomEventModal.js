import { jsx, jsxs } from "react/jsx-runtime";
import HeartIcon from "./icons/HeartIcon";
const RandomEventModal = ({ event, deltas, onClose }) => {
  const formatCurrency = (val) => new Intl.NumberFormat("de-DE", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(val);
  const hasEffects = deltas && (deltas.capitalChange !== 0 || deltas.reputationChange !== 0 || deltas.researchPointsChange !== 0);
  const hasWeddingPortraits = event.customVariables && event.customVariables.playerPortraitUrl && event.customVariables.partnerPortraitUrl;
  const playerPortrait = event.customVariables?.playerPortraitUrl;
  const partnerPortrait = event.customVariables?.partnerPortraitUrl;
  const breakupPortrait = event.customVariables?.breakupPortraitUrl;
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "fixed inset-0 z-[100] flex items-center justify-center p-4",
      "aria-modal": "true",
      role: "dialog",
      onClick: () => !event.actions && onClose(),
      children: [
        event.backgroundImage ? /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 z-0", children: [
          /* @__PURE__ */ jsx("img", { src: event.backgroundImage, alt: "", className: "w-full h-full object-cover" }),
          /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black bg-opacity-40" })
        ] }) : /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm z-0" }),
        /* @__PURE__ */ jsxs(
          "div",
          {
            className: "relative z-10 bg-gray-800 bg-opacity-95 border border-amber-500 rounded-lg shadow-2xl w-full max-w-xl p-8 text-center",
            onClick: (e) => e.stopPropagation(),
            children: [
              hasWeddingPortraits && /* @__PURE__ */ jsxs("div", { className: "flex justify-center items-center gap-6 mb-6", children: [
                /* @__PURE__ */ jsx("div", { className: "w-36 h-36 rounded-full border-4 border-amber-500 overflow-hidden shadow-lg bg-gray-700", children: /* @__PURE__ */ jsx("img", { src: playerPortrait, alt: "Player", className: "w-full h-full object-cover" }) }),
                /* @__PURE__ */ jsx(HeartIcon, { className: "w-12 h-12 text-rose-500 animate-pulse", filled: true }),
                /* @__PURE__ */ jsx("div", { className: "w-36 h-36 rounded-full border-4 border-pink-500 overflow-hidden shadow-lg bg-gray-700", children: /* @__PURE__ */ jsx("img", { src: partnerPortrait, alt: "Partner", className: "w-full h-full object-cover" }) })
              ] }),
              breakupPortrait && /* @__PURE__ */ jsxs("div", { className: "flex justify-center items-center mb-6 relative", children: [
                /* @__PURE__ */ jsx("div", { className: "w-32 h-32 rounded-full border-4 border-red-500 overflow-hidden shadow-lg bg-gray-700 grayscale", children: /* @__PURE__ */ jsx("img", { src: breakupPortrait, alt: "Ex-Partner", className: "w-full h-full object-cover" }) }),
                /* @__PURE__ */ jsx("div", { className: "absolute -bottom-2 bg-red-900 text-white text-xs px-2 py-1 rounded border border-red-500 font-bold", children: "Ex-Partner" })
              ] }),
              /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold font-cinzel text-amber-400 mb-4", children: event.title }),
              /* @__PURE__ */ jsx("p", { className: "text-gray-300 text-lg mb-6 whitespace-pre-wrap", children: event.text }),
              hasEffects && /* @__PURE__ */ jsxs("div", { className: "my-6 py-4 border-t border-b border-gray-600 space-y-2 text-lg", children: [
                /* @__PURE__ */ jsx("p", { className: "font-bold text-amber-300 uppercase text-sm tracking-wider", children: "Auswirkungen:" }),
                deltas.capitalChange !== 0 && /* @__PURE__ */ jsxs("p", { className: `font-semibold ${deltas.capitalChange > 0 ? "text-green-400" : "text-red-400"}`, children: [
                  "Kapital: ",
                  deltas.capitalChange > 0 ? "+" : "",
                  formatCurrency(deltas.capitalChange)
                ] }),
                deltas.reputationChange !== 0 && /* @__PURE__ */ jsxs("p", { className: `font-semibold ${deltas.reputationChange > 0 ? "text-green-400" : "text-red-400"}`, children: [
                  "Ruf: ",
                  deltas.reputationChange > 0 ? "+" : "",
                  deltas.reputationChange,
                  " Punkte"
                ] }),
                deltas.researchPointsChange !== 0 && /* @__PURE__ */ jsxs("p", { className: `font-semibold ${deltas.researchPointsChange > 0 ? "text-green-400" : "text-red-400"}`, children: [
                  "Forschungsfortschritt: ",
                  deltas.researchPointsChange > 0 ? "+" : "",
                  deltas.researchPointsChange,
                  " FP"
                ] })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "mt-6 flex justify-center gap-4", children: event.actions ? event.actions.map((action) => /* @__PURE__ */ jsxs("div", { className: "relative group", children: [
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => onClose(action.value),
                    className: action.className || "bg-amber-500 text-gray-900 font-bold py-3 px-12 rounded-sm uppercase tracking-wider transform hover:bg-amber-400 transition-all duration-300 ease-in-out shadow-lg shadow-amber-500/20",
                    children: action.text
                  }
                ),
                action.tooltip && /* @__PURE__ */ jsxs("div", { className: "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs px-3 py-1.5 bg-black/90 text-white text-xs rounded border border-gray-600 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-xl", children: [
                  action.tooltip,
                  /* @__PURE__ */ jsx("div", { className: "absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-black/90" })
                ] })
              ] }, action.value)) : /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => onClose(),
                  className: "bg-amber-500 text-gray-900 font-bold py-3 px-12 rounded-sm uppercase tracking-wider transform hover:bg-amber-400 transition-all duration-300 ease-in-out shadow-lg shadow-amber-500/20",
                  children: "OK"
                }
              ) })
            ]
          }
        )
      ]
    }
  );
};
var RandomEventModal_default = RandomEventModal;
export {
  RandomEventModal_default as default
};
