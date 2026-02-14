const passwordDisplay = document.getElementById('password');
const lengthSlider = document.getElementById('length');
const lengthValue = document.getElementById('lengthValue');
const uppercaseEl = document.getElementById('uppercase');
const lowercaseEl = document.getElementById('lowercase');
const numbersEl = document.getElementById('numbers');
const symbolsEl = document.getElementById('symbols');
const generateBtn = document.getElementById('generate');
const copyBtn = document.getElementById('copy');
const strengthEl = document.getElementById('strength');

// Update length display
lengthSlider.addEventListener('input', () => {
  lengthValue.textContent = lengthSlider.value;
});

// Generate button
generateBtn.addEventListener('click', () => {
  const length = +lengthSlider.value;
  const hasUpper = uppercaseEl.checked;
  const hasLower = lowercaseEl.checked;
  const hasNum = numbersEl.checked;
  const hasSym = symbolsEl.checked;

  if (!hasUpper && !hasLower && !hasNum && !hasSym) {
    alert("Please select at least one character type!");
    return;
  }

  passwordDisplay.value = generatePassword(length, hasUpper, hasLower, hasNum, hasSym);
  updateStrength(length, hasUpper, hasLower, hasNum, hasSym);
});

// Copy button
copyBtn.addEventListener('click', () => {
  if (!passwordDisplay.value) return;
  navigator.clipboard.writeText(passwordDisplay.value);
  copyBtn.textContent = "Copied!";
  setTimeout(() => copyBtn.textContent = "Copy to Clipboard", 2000);
});

// Password generation function
function generatePassword(length, upper, lower, num, sym) {
  const upperChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowerChars = "abcdefghijklmnopqrstuvwxyz";
  const numChars = "0123456789";
  const symChars = "!@#$%^&*()_+-=[]{}|;:,.<>?/~";

  let allowed = "";
  if (upper) allowed += upperChars;
  if (lower) allowed += lowerChars;
  if (num) allowed += numChars;
  if (sym) allowed += symChars;

  if (allowed.length === 0) return "";

  let password = "";
  const array = new Uint32Array(length);
  window.crypto.getRandomValues(array);

  for (let i = 0; i < length; i++) {
    password += allowed[array[i] % allowed.length];
  }
  return password;
}

// Strength calculation + progress bar + crack time estimate
function updateStrength(length, hasUpper, hasLower, hasNum, hasSym) {
  const typesCount = [hasUpper, hasLower, hasNum, hasSym].filter(Boolean).length;

  // Base score
  let score = length * 1.2;
  if (hasUpper)  score += 8;
  if (hasLower)  score += 6;
  if (hasNum)    score += 6;
  if (hasSym)    score += 12;

  // Bonus for very long passwords
  if (length >= 25) score += 20;
  else if (length >= 20) score += 15;
  else if (length >= 16) score += 10;
  else if (length >= 12) score += 5;

  // Penalty for short or few types
  if (length < 8 || typesCount < 2) score = Math.min(score, 15);
  else if (length < 12 || typesCount < 3) score = Math.min(score, 30);

  // Normalize to 0-100 for progress bar
  let progress = Math.min(Math.max(Math.round(score), 0), 100);

  // Determine strength level
  let strength = "Very Weak";
  let className = "very-weak";

  if (score >= 70) {
    strength = "Very Strong";
    className = "very-strong";
  } else if (score >= 55) {
    strength = "Strong";
    className = "strong";
  } else if (score >= 45) {
    strength = "Very Good";
    className = "very-good";
  } else if (score >= 35) {
    strength = "Good";
    className = "good";
  } else if (score >= 20) {
    strength = "Weak";
    className = "weak";
  }

  // Simple crack time estimate (very approximate, for fun/education)
  let crackTime = "";
  if (progress < 20)      crackTime = "a few seconds to minutes";
  else if (progress < 40) crackTime = "hours to days";
  else if (progress < 60) crackTime = "months to years";
  else if (progress < 80) crackTime = "centuries";
  else                    crackTime = "millennia (practically impossible)";

  // Update DOM
  const strengthEl = document.getElementById('strength');
  strengthEl.className = className;

  document.getElementById('strength-text').textContent = `Password Strength: ${strength}`;
  document.getElementById('progress-bar').style.width = `${progress}%`;
  document.getElementById('crack-time').textContent = `Estimated crack time: ${crackTime}`;
}


// Password টেক্সটে ক্লিক করলেই কপি হবে + visual feedback
passwordDisplay.addEventListener('click', () => {
  if (!passwordDisplay.value) return;

  // নতুন: visual feedback শুরু
  passwordDisplay.classList.add('clicked');

  navigator.clipboard.writeText(passwordDisplay.value)
    .then(() => {
      const originalText = passwordDisplay.value;
      passwordDisplay.value = "Copied!";
      passwordDisplay.style.color = "#4caf50";

      // ১.৫ সেকেন্ড পর সব রিসেট
      setTimeout(() => {
        passwordDisplay.value = originalText;
        passwordDisplay.style.color = "white";
        passwordDisplay.classList.remove('clicked');  // ← গ্লো + scale সরিয়ে দেয়
      }, 1500);
    })
    .catch(err => {
      console.error("Failed to copy: ", err);
      passwordDisplay.value = "Copy failed!";
      passwordDisplay.style.color = "#ff4d4d";
      setTimeout(() => {
        passwordDisplay.value = passwordDisplay.dataset.lastPassword || "";
        passwordDisplay.style.color = "white";
        passwordDisplay.classList.remove('clicked');
      }, 2000);
    });
});
