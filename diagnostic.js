// Compass Seed Diagnostic.
// Other tools can edit the questions here. The page itself is index.html.
const questions = [
  { prompt: "What do you want more time for?", hint: "Pick every one that fits.", multiple: true, options: ["Family", "Health", "Quiet", "Travel", "Building something"] },
  { prompt: "What are you best at?", hint: "Pick every one that fits.", multiple: true, options: ["People", "Building systems", "Selling", "Teaching", "Figuring things out"] },
  { prompt: "What would a good day look like?", hint: "Pick every one that fits.", multiple: true, options: ["Days that aren't full", "Income that covers the life", "Work I can step away from", "Room to think", "Being present"] },
  { prompt: "Where is your attention going right now?", hint: "Pick every one that fits.", multiple: true, options: ["Work that pays", "Family", "Learning AI", "A side project", "Scattered"] },
  { prompt: "What are you tired of doing by hand?", hint: "Pick every one that fits.", multiple: true, options: ["Writing the same messages", "Chasing follow-ups", "Organizing notes", "Making content", "Explaining the same thing"] },
  { prompt: "What do you want to keep in your own hands?", hint: "Pick every one that fits.", multiple: true, options: ["Judgment", "Relationships", "Creativity", "The final call"] },
  { prompt: "What do you stand for when you decide?", hint: "Pick every one that fits.", multiple: true, options: ["Family first", "Keep your word", "Stay free", "Build something that lasts", "Help people grow"] },
  { prompt: "What interests you most?", hint: "Pick every one that fits.", multiple: true, options: ["Learning AI", "Building a business", "Both", "I want to see what this is"] },
  { prompt: "Which of these is closest to where you are?", hint: "Pick one.", multiple: false, options: ["A career behind me", "Building something now", "Looking for what is next", "Not sure yet"] },
  { prompt: "Where do you want to be in three years?", hint: "Pick one.", multiple: false, options: ["Financially independent", "Leading a small team", "Working from home", "Less time on the tools", "Still deciding"] },
  { prompt: "How ready are you to start something new?", hint: "Pick one.", multiple: false, options: ["Ready now", "Curious", "Not yet", "I need to talk it through"] },
];

const root = document.getElementById("diagnostic");
if (root) {
  const answers = questions.map(() => []);
  let words = "";
  let name = "";
  let email = "";
  let phone = "";
  let step = 0;
  const total = questions.length + 2;

  const join = (values) => {
    const lower = values.map((value) => value.charAt(0).toLowerCase() + value.slice(1));
    if (lower.length < 2) return lower[0] || "";
    if (lower.length === 2) return lower[0] + " and " + lower[1];
    return lower.slice(0, -1).join(", ") + ", and " + lower[lower.length - 1];
  };

  const letter = () => {
    const parts = answers.map(join);
    if (parts.some((part) => !part)) return "";
    const years = parts[9] === "still deciding"
      ? "You are still choosing the three-year picture, and that is a real answer."
      : "In three years you want " + parts[9] + ".";
    const lines = [
      "You want more time for " + parts[0] + ".",
      "You are best at " + parts[1] + ".",
      "A good day looks like " + parts[2] + ".",
      "Your attention is going to " + parts[3] + ".",
      "You are tired of " + parts[4] + " by hand.",
      "You want to keep " + parts[5] + " in your own hands.",
      "When you decide, you stand for " + parts[6] + ".",
      "What interests you most: " + parts[7] + ".",
      "Closest to where you are: " + parts[8] + ".",
      years,
      "Readiness: " + parts[10] + ".",
    ];
    if (words.trim()) lines.push(words.trim());
    return lines.join(" ");
  };

  const button = (label, className, onClick, disabled) => {
    const el = document.createElement("button");
    el.type = "button";
    el.className = className;
    el.textContent = label;
    el.disabled = disabled;
    el.addEventListener("click", onClick);
    return el;
  };

  const render = () => {
    root.innerHTML = "";
    const card = document.createElement("div");
    card.className = "rounded-3xl border border-line bg-cream p-6 shadow-lift sm:p-8";

    if (step >= total) {
      const seed = letter();
      card.innerHTML =
        '<p class="text-sm font-medium tracking-wide text-sun-deep uppercase">Your Compass Seed</p>' +
        '<p class="mt-4 font-display text-2xl leading-snug text-ink"></p>' +
        '<p class="mt-4 text-muted">You\'re in the first step. I\'ve got your answers and I\'ll read them. If we should build together, I\'ll reach out to ' +
        email.trim() +
        ".</p>";
      card.querySelector("p.font-display").textContent = seed;
      card.append(
        button("Start again", "mt-6 inline-flex min-h-12 items-center justify-center rounded-full border border-line px-5 font-medium", () => {
          answers.forEach((list) => (list.length = 0));
          words = name = email = phone = "";
          step = 0;
          render();
        }, false),
      );
      root.append(card);
      return;
    }

    const head = document.createElement("div");
    head.className = "flex items-center justify-between gap-4 text-sm text-muted";
    head.innerHTML = "<span>Compass Seed Diagnostic</span><span>" + (step + 1) + " / " + total + "</span>";
    const bar = document.createElement("div");
    bar.className = "mt-3 h-1 overflow-hidden rounded-full bg-line";
    bar.innerHTML = '<div class="h-full bg-sun" style="width:' + ((step + 1) / total) * 100 + '%"></div>';
    card.append(head, bar);

    const body = document.createElement("div");
    body.className = "mt-6";
    if (step < questions.length) {
      const q = questions[step];
      const title = document.createElement("h3");
      title.className = "text-3xl leading-tight";
      title.textContent = q.prompt;
      const hint = document.createElement("p");
      hint.className = "mt-2 text-muted";
      hint.textContent = q.hint;
      const list = document.createElement("div");
      list.className = "mt-5 grid gap-2";
      q.options.forEach((option) => {
        const on = answers[step].includes(option);
        list.append(
          button(
            option,
            "min-h-12 rounded-2xl border px-4 text-left text-base " + (on ? "border-sun bg-sun text-pine" : "border-line bg-paper text-ink"),
            () => {
              const picked = answers[step];
              if (q.multiple) {
                const i = picked.indexOf(option);
                if (i >= 0) picked.splice(i, 1);
                else picked.push(option);
              } else {
                answers[step] = [option];
              }
              render();
            },
            false,
          ),
        );
      });
      body.append(title, hint, list);
    } else if (step === questions.length) {
      body.innerHTML = '<h3 class="text-3xl leading-tight">Anything you want added, in your own words?</h3><p class="mt-2 text-muted">Optional. Skip it if you have nothing to add.</p>';
      const area = document.createElement("textarea");
      area.className = "mt-4 w-full resize-y rounded-2xl border border-line bg-paper px-4 py-3 text-base text-ink";
      area.rows = 4;
      area.placeholder = "A sentence is enough.";
      area.value = words;
      area.addEventListener("input", () => (words = area.value));
      body.append(area);
    } else {
      body.innerHTML = '<h3 class="text-3xl leading-tight">This is how I reach you.</h3><p class="mt-2 text-muted">I\'ll read your answers and reach out to this email if we should build together.</p>';
      [["Name", "name", name], ["Email", "email", email], ["Phone", "tel", phone]].forEach(([label, type, value]) => {
        const wrap = document.createElement("label");
        wrap.className = "mt-5 block";
        wrap.innerHTML = '<span class="text-sm font-medium">' + label + "</span>";
        const input = document.createElement("input");
        input.className = "mt-2 w-full min-h-12 rounded-2xl border border-line bg-paper px-4 text-base";
        input.type = type === "name" ? "text" : type;
        input.value = value;
        input.addEventListener("input", () => {
          if (label === "Name") name = input.value;
          if (label === "Email") email = input.value;
          if (label === "Phone") phone = input.value;
        });
        wrap.append(input);
        body.append(wrap);
      });
    }
    card.append(body);

    const error = document.createElement("p");
    error.className = "mt-4 hidden text-base";
    error.style.color = "#b3261e";
    error.setAttribute("role", "alert");
    card.append(error);

    const row = document.createElement("div");
    row.className = "mt-6 flex items-center justify-between gap-3";
    row.append(
      button("Back", "inline-flex min-h-12 items-center rounded-full px-3 text-ink", () => { step = Math.max(0, step - 1); render(); }, step === 0),
    );
    const canContinue = step >= questions.length || answers[step].length > 0;
    const last = step === total - 1;
    row.append(
      button(
        last ? "Submit my assessment" : "Continue",
        "inline-flex min-h-12 items-center rounded-full bg-sun px-5 font-medium text-pine disabled:opacity-40",
        async (event) => {
          if (!last) {
            step += 1;
            render();
            return;
          }
          if (!name.trim() || !email.includes("@") || !phone.trim()) {
            alert("Leave your name, a real email, and a phone number.");
            return;
          }
          const submitButton = event.currentTarget;
          submitButton.disabled = true;
          submitButton.textContent = "Sending…";
          error.classList.add("hidden");
          try {
            const response = await fetch("/.netlify/functions/diagnostic", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: name.trim(),
                email: email.trim(),
                phone: phone.trim(),
                words: words.trim(),
                seed: letter(),
                answers: questions.map((q, i) => ({ prompt: q.prompt, picked: answers[i] })),
              }),
            });
            const result = await response.json().catch(() => ({}));
            if (!response.ok || !result.ok) throw new Error(result.error || "send failed");
          } catch {
            submitButton.disabled = false;
            submitButton.textContent = "Submit my assessment";
            error.textContent = "I couldn't save that just now — check your connection and try again. Your answers are still here.";
            error.classList.remove("hidden");
            return;
          }
          step += 1;
          render();
        },
        !canContinue,
      ),
    );
    card.append(row);
    root.append(card);
  };

  render();
}
