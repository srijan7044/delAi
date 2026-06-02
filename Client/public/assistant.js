(function () {
  // userData

  const script = document.currentScript;

  const userId = script?.dataset?.userId;

  const theme = "dark";

  let assistantConfig = null;

  // State for voice recognition and dialogue
  let activeRecognition = null;
  let wakeRecognition = null;
  let wakeWordListening = false;
  let hasWokenUp = false;
  let abortController = null;

  // load CSS

  const link = document.createElement("link");

  link.rel = "stylesheet";

  link.href = "https://delai.onrender.com/assistant.css";

  document.head.appendChild(link);

  // Create PopUp

  const popup = document.createElement("div");

  popup.className = `delAi-popup theme-${theme}`;

  popup.innerHTML = `
    <div class="delAi-overlay"></div>

    <div class="delAi-content">

       <div class="delAi-top">
            <div class="delAi-orb-wrap">

                <div class="delAi-orb-glow"></div>

                <div class="delAi-orb"></div>

            </div>

            <h2 class="delAi-title">
                Hello! I'm delAi
            </h2>

            <p class="delAi-sub">
                Your smart voice assistant.
                <br />
                Ask anything about website.
            </p>


            <div class="delAi-status">
                Tap button to Speak
            </div>

            <div class="delAi-wave">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
            </div>

            <!-- User Text -->
            <div class="delAi-user-text">
            </div>

            <!-- AI Text -->
            <div class="delAi-ai-text">
            </div>
  
        </div>


        <div class="delAi-bottom">
            
            <button class="delAi-mic">

               <img 
               src="https://delai.onrender.com/mic.svg"
               alt="mic"
               class="delAi-mic-icon"/>
            </button>
        </div>
    </div>
    
    `;

  document.body.appendChild(popup);

  // floating Button

  const button = document.createElement("button");

  button.className = `delAi-btn theme-${theme}`;

  button.innerHTML = `
    <img 
    src="https://delai.onrender.com/logo.png"
    alt="logo"
    />`;
  document.body.appendChild(button);

  // toggle popup

  let open = false;

  button.onclick = () => {
    open = !open;
    popup.style.display = open ? "flex" : "none";
    hasWokenUp = false; // Reset dialogue state when widget state toggles
    if (open) {
      startWakeWordListening();
    } else {
      stopWakeWordListening();
      if (activeRecognition) {
        activeRecognition.abort();
        activeRecognition = null;
      }
      window.speechSynthesis.cancel();
      if (abortController) {
        abortController.abort();
      }
      status.innerText = "Tap button to Speak";
      wave.style.opacity = "0";
    }
  };

  // load Assistant

  const loadAssistant = async () => {
    try {
      const res = await fetch(
        `https://delaiserver.onrender.com/api/assistant/config/${userId}`,
      );

      const data = await res.json();

      if (data) {
        assistantConfig = data.user;
        applyConfig();
        // If popup is already open at load time, start listening
        if (open) {
          startWakeWordListening();
        }
      }
    } catch (error) {
      console.log("Assistant Load Error:", error);
    }
  };

  const applyConfig = () => {
    if (!assistantConfig) return;

    popup.className = `delAi-popup theme-${assistantConfig.theme}`;

    button.className = `delAi-btn theme-${assistantConfig.theme}`;

    const title = popup.querySelector(".delAi-title");

    title.innerHTML = `Hello! I'm ${assistantConfig.assistantName}`;

    const subTitle = popup.querySelector(".delAi-sub");
    subTitle.innerHTML = `
    Welcome to
    ${assistantConfig.businessName}.
    <br />
    Ask anything about your website.
  `;
  };

  // Element

  const status = popup.querySelector(".delAi-status");

  const wave = popup.querySelector(".delAi-wave");

  const userText = popup.querySelector(".delAi-user-text");

  const aiText = popup.querySelector(".delAi-ai-text");

  const mic = popup.querySelector(".delAi-mic");

  // text-speech

  const speak = (text) => {
    window.speechSynthesis.cancel();

    // Show AI response
    aiText.innerText = text;

    status.innerText = "AI Speaking...";

    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "hi-IN";
    speech.rate = 1;
    speech.pitch = 1;
    speech.volume = 1;

    speech.onstart = () => {
      // Start active listening for barge-in while AI is speaking!
      if (hasWokenUp) {
        startActiveListening();
      }
    };

    const endSpeechAction = () => {
      status.innerText = "Tap button to Speak";
      wave.style.opacity = "0";

      // If a new speech utterance started immediately after, don't stop active dialogue
      if (window.speechSynthesis.speaking) return;

      if (open) {
        if (hasWokenUp) {
          startActiveListening();
        } else {
          setTimeout(startWakeWordListening, 500);
        }
      }
    };

    // Voice end
    speech.onend = endSpeechAction;
    speech.onerror = endSpeechAction;

    // Start speaking
    window.speechSynthesis.speak(speech);
  };

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  const startWakeWordListening = () => {
    if (!SpeechRecognition || wakeWordListening || activeRecognition) return;

    try {
      wakeRecognition = new SpeechRecognition();
      wakeRecognition.lang = "en-US";
      wakeRecognition.continuous = true;
      wakeRecognition.interimResults = false;

      wakeRecognition.onstart = () => {
        wakeWordListening = true;
        console.log("Listening for wake word...");
      };

      wakeRecognition.onresult = (e) => {
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const result = e.results[i];
          if (!result.isFinal) continue;

          const transcript = result[0].transcript;
          const cleanText = transcript.toLowerCase();
          const name = (assistantConfig?.assistantName || "delAi").toLowerCase();

          if (cleanText.includes(name)) {
            console.log("Wake word detected:", transcript);
            
            // Set woke up status
            hasWokenUp = true;

            // Immediately stop wake word listening
            stopWakeWordListening();

            // Extract the query by removing the wake word
            const regex = new RegExp(name, 'gi');
            const queryText = transcript.replace(regex, "").replace(/^[,\s\.\?]+|[,\s\.\?]+$/g, "").trim();

            if (queryText.length > 1) {
              // User said name + question in one breath
              userText.innerText = "You: " + queryText;
              processQuery(queryText);
            } else {
              // User just said the name, trigger active listening for question
              startActiveListening();
            }
            break;
          }
        }
      };

      wakeRecognition.onerror = (err) => {
        console.log("Wake recognition error:", err);
      };

      wakeRecognition.onend = () => {
        wakeWordListening = false;
        // Auto-restart background listening if popup is still open and we haven't woken up
        if (open && !hasWokenUp && !activeRecognition && !window.speechSynthesis.speaking) {
          setTimeout(startWakeWordListening, 500);
        }
      };

      wakeRecognition.start();
    } catch (err) {
      console.log("Wake recognition start failure:", err);
    }
  };

  const stopWakeWordListening = () => {
    if (wakeRecognition) {
      wakeRecognition.onend = null;
      wakeRecognition.onerror = null;
      wakeRecognition.stop();
      wakeRecognition = null;
    }
    wakeWordListening = false;
  };

  const startActiveListening = () => {
    stopWakeWordListening();

    if (!SpeechRecognition) return;
    if (activeRecognition) return; // Prevent duplicate instances

    try {
      activeRecognition = new SpeechRecognition();
      activeRecognition.lang = "en-US";
      activeRecognition.continuous = false;
      activeRecognition.interimResults = false;

      activeRecognition.onresult = (e) => {
        const text = e.results[0][0].transcript;
        console.log("Active result received:", text);

        // Barge-in: immediately cancel speaking and thinking on new speech
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
        }
        if (abortController) {
          abortController.abort();
        }

        userText.innerText = "You: " + text;
        activeRecognition.stop();
        activeRecognition = null;
        processQuery(text);
      };

      const handleActiveEnd = () => {
        activeRecognition = null;
        
        // Resume correct listening mode
        if (open && hasWokenUp && !window.speechSynthesis.speaking && status.innerText !== "Thinking...") {
          setTimeout(startActiveListening, 300);
        } else if (open && !hasWokenUp) {
          setTimeout(startWakeWordListening, 500);
        }
      };

      activeRecognition.onerror = (err) => {
        console.log("Active recognition error:", err);
        handleActiveEnd();
      };
      
      activeRecognition.onend = () => {
        handleActiveEnd();
      };

      activeRecognition.start();
      wave.style.opacity = "1";
      if (status.innerText !== "Thinking..." && !window.speechSynthesis.speaking) {
        status.innerText = "Listening...";
      }
    } catch (err) {
      console.log("Active recognition start failure:", err);
    }
  };

  const processQuery = (text) => {
    status.innerText = "Thinking...";
    wave.style.opacity = "0";

    // Setup fetch cancellation
    if (abortController) abortController.abort();
    abortController = new AbortController();
    const { signal } = abortController;

    // Listen during thinking for barge-in
    if (hasWokenUp) {
      setTimeout(startActiveListening, 100);
    }

    setTimeout(async () => {
      try {
        const res = await fetch("https://delaiserver.onrender.com/api/assistant/ask", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: text,
            userId,
          }),
          signal,
        });

        const data = await res.json();
        console.log(data);

        if (signal.aborted) return;

        if (data.success) {
          if (data.action === "navigate") {
            speak(data.response);

            setTimeout(() => {
              window.location.href = data.path;
            }, 1500);
          } else {
            speak(data.aiResponse);
          }
        } else {
          speak("Response Error please Check your plan");
        }
      } catch (error) {
        if (error.name === "AbortError") {
          console.log("Request aborted.");
          return;
        }
        console.log(error);
        speak("AI Server Error");
      }
    }, 600);
  };

  if (SpeechRecognition) {
    mic.onclick = () => {
      hasWokenUp = true; // Activating manually locks wake state
      startActiveListening();
    };
  } else {
    status.innerText = "Speech Recognition not supported";
  }

  loadAssistant();
})();
