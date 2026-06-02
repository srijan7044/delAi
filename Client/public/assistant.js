(function () {
  // userData

  const script = document.currentScript;

  const userId = script?.dataset?.userId;

  const theme = "dark";

  let assistantConfig = null;

  // load CSS

  const link = document.createElement("link");

  link.rel = "stylesheet";

  link.href = "http://localhost:5173/assistant.css";

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
                Ask anything about your website.
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
               src="http://localhost:5173/mic.svg"
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
    src="http://localhost:5173/logo.png"
    alt="logo"
    />`;
  document.body.appendChild(button);

  // toggle popup

  let open = false;

  button.onclick = () => {
    open = !open;
    popup.style.display = open ? "flex" : "none";
  };

  // load Assistant

  const loadAssistant = async () => {
    try {
      const res = await fetch(
        `http://localhost:8000/api/assistant/config/${userId}`,
      );

      const data = await res.json();

      if (data) {
        assistantConfig = data.user;
        applyConfig();
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

  loadAssistant();

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

    // Voice end
    speech.onend = () => {
      status.innerText = "Tap button to Speak";

      wave.style.opacity = "0";
    };

    // Start speaking
    window.speechSynthesis.speak(speech);
  };

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (SpeechRecognition) {
    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";

    recognition.continuous = false;

    recognition.interimResults = false;

    mic.onclick = () => {
      wave.style.opacity = "1";

      status.innerText = "Listening...";

      userText.innerText = "";

      aiText.innerText = "";

      recognition.start();
    };

    recognition.onresult = (e) => {
      const text = e.results[0][0].transcript;

      userText.innerText = "You: " + text;

      recognition.stop();

      setTimeout(async () => {
        try {
          status.innerText = "Thinking...";

          const res = await fetch("http://localhost:8000/api/assistant/ask", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              message: text,
              userId,
            }),
          });

          const data = await res.json();
          console.log(data);

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
          console.log(error);
          speak("AI Server Error");
        }
      }, 600);
    };

    recognition.onerror = () => {
      status.innerText = "Tap button to Speak";

      wave.style.opacity = "0";
    };
  } else {
    status.innerText = "Speech Recognition not supported";
  }
})();
