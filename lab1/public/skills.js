const skillForm = document.getElementById("skill-form");
const skillInput = document.getElementById("skill");
const skillError = document.getElementById("skill-error");
const skillList = document.getElementById("skill-list");

// Întoarce mesajul de eroare sau "" dacă skill-ul e valid.
function validateSkill(value) {
  if (value === "") return "Skill-ul este obligatoriu.";
  if (value.length < 2) return "Skill-ul trebuie să aibă cel puțin 2 caractere.";
  if (value.length > 30) return "Skill-ul poate avea cel mult 30 de caractere.";
  if (!/^[\p{L}\d][\p{L}\d .+#/-]*$/u.test(value)) {
    return "Skill-ul poate conține doar litere, cifre, spații și semnele . + # / -";
  }
  const exists = [...skillList.children].some(
    (item) => item.textContent.toLowerCase() === value.toLowerCase()
  );
  if (exists) return "Skill-ul există deja în listă.";
  return "";
}

function showSkillError(message) {
  skillError.textContent = message;
  skillInput.classList.toggle("invalid", message !== "");
  skillInput.setAttribute("aria-invalid", String(message !== ""));
}

skillForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const value = skillInput.value.trim();
  const message = validateSkill(value);
  showSkillError(message);
  if (message !== "") {
    skillInput.focus();
    return;
  }

  const item = document.createElement("li");
  item.textContent = value;
  skillList.append(item);
  skillForm.reset();
  skillInput.focus();
});

// După prima eroare, câmpul se revalidează pe măsură ce utilizatorul tastează.
skillInput.addEventListener("input", () => {
  if (skillInput.classList.contains("invalid")) {
    showSkillError(validateSkill(skillInput.value.trim()));
  }
});
