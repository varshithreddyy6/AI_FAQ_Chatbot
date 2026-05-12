const chatContainer =
  document.getElementById("chatContainer");

const userInput =
  document.getElementById("userInput");

const sendBtn =
  document.getElementById("sendBtn");

const newChatBtn =
  document.getElementById("newChatBtn");

const historyList =
  document.getElementById("historyList");

/* STORAGE */

let allChats =
  JSON.parse(
    localStorage.getItem("allChats")
  ) || [];

/* CURRENT CHAT */

let currentChatIndex = null;

/* SAVE */

function saveChats(){

  localStorage.setItem(
    "allChats",
    JSON.stringify(allChats)
  );
}

/* TIME */

function getTime(){

  const now = new Date();

  return now.toLocaleTimeString(
    [],
    {
      hour:"2-digit",
      minute:"2-digit"
    }
  );
}

/* SCROLL */

function scrollBottom(){

  chatContainer.scrollTop =
    chatContainer.scrollHeight;
}

/* FOOTER */

function addFooter(
  bubble,
  text,
  time
){

  const footer =
    document.createElement("div");

  footer.classList.add(
    "message-footer"
  );

  const left =
    document.createElement("div");

  left.style.display = "flex";

  left.style.alignItems = "center";

  left.style.gap = "8px";

  const timeDiv =
    document.createElement("div");

  timeDiv.classList.add("time");

  timeDiv.innerText = time;

  left.appendChild(timeDiv);

  if(text){

    const copyBtn =
      document.createElement("button");

    copyBtn.classList.add(
      "copy-btn"
    );

    copyBtn.innerHTML = "📋";

    copyBtn.onclick = async ()=>{

      await navigator.clipboard.writeText(
        text
      );

      copyBtn.innerHTML = "✅";

      setTimeout(()=>{

        copyBtn.innerHTML = "📋";

      },1500);

    };

    left.appendChild(copyBtn);
  }

  footer.appendChild(left);

  bubble.appendChild(footer);
}

/* CREATE MESSAGE */

function createMessage(
  text,
  sender,
  time = getTime()
){

  const msg =
    document.createElement("div");

  msg.classList.add(
    "message",
    sender
  );

  const bubble =
    document.createElement("div");

  bubble.classList.add("bubble");

  /* CONTENT */

  const content =
    document.createElement("div");

  content.innerHTML =
    marked.parse(text);

  bubble.appendChild(content);

  /* FOOTER */

  if(sender === "ai"){

    addFooter(
      bubble,
      text,
      time
    );

  }else{

    addFooter(
      bubble,
      null,
      time
    );
  }

  msg.appendChild(bubble);

  chatContainer.appendChild(msg);

  scrollBottom();

  return content;
}

/* LOADING */

function createLoadingBubble(){

  const msg =
    document.createElement("div");

  msg.classList.add(
    "message",
    "ai"
  );

  const bubble =
    document.createElement("div");

  bubble.classList.add("bubble");

  bubble.innerHTML = `

    <div class="loading">
      <span></span>
      <span></span>
      <span></span>
    </div>

  `;

  msg.appendChild(bubble);

  chatContainer.appendChild(msg);

  scrollBottom();

  return bubble;
}

/* TYPE EFFECT */

async function typeMessage(
  bubble,
  text
){

  bubble.innerHTML = `

    <div class="typing-text"></div>

    <div class="message-footer"></div>

  `;

  const textDiv =
    bubble.querySelector(
      ".typing-text"
    );

  let i = 0;

  const speed = 8;

  return new Promise((resolve)=>{

    const interval =
      setInterval(()=>{

        textDiv.innerHTML =
          marked.parse(
            text.substring(0,i)
          );

        i++;

        scrollBottom();

        if(i > text.length){

          clearInterval(interval);

          const footer =
            bubble.querySelector(
              ".message-footer"
            );

          addFooter(
            footer.parentElement,
            text,
            getTime()
          );

          footer.remove();

          resolve();
        }

      },speed);

  });
}

/* LOAD CHAT */

function loadChat(index){

  chatContainer.innerHTML = "";

  const chat =
    allChats[index];

  if(!chat) return;

  currentChatIndex = index;

  chat.messages.forEach(m=>{

    createMessage(
      m.text,
      m.sender,
      m.time
    );

  });

  scrollBottom();
}

/* DELETE CHAT */

function deleteChat(index){

  allChats.splice(index,1);

  saveChats();

  renderHistory();

  startNewChat();
}

/* RENDER HISTORY */

function renderHistory(){

  historyList.innerHTML = "";

  allChats.forEach(
    (chat,index)=>{

      const item =
        document.createElement("div");

      item.classList.add(
        "history-item"
      );

      const title =
        document.createElement("span");

      title.innerText =
        chat.title;

      title.onclick = ()=>{

        loadChat(index);

      };

      const deleteBtn =
        document.createElement("button");

      deleteBtn.innerHTML = "🗑";

      deleteBtn.classList.add(
        "delete-btn"
      );

      deleteBtn.onclick = (e)=>{

        e.stopPropagation();

        deleteChat(index);

      };

      item.appendChild(title);

      item.appendChild(deleteBtn);

      historyList.appendChild(item);

    }
  );
}

/* NEW CHAT */

function startNewChat(){

  currentChatIndex = null;

  chatContainer.innerHTML = `
    <div class="message ai">
      <div class="bubble">

        👋 Hello! Ask me anything.

        <div class="message-footer">
          <div style="display:flex;align-items:center;gap:8px;">
            <div class="time">
              ${getTime()}
            </div>
          </div>
        </div>

      </div>
    </div>
  `;
}

/* SEND */

async function sendMessage(){

  const text =
    userInput.value.trim();

  if(!text) return;

  /* NEW CHAT */

  if(currentChatIndex === null){

    const cleanTitle =
      text
        .replace(/\n/g," ")
        .trim()
        .substring(0,30);

    const newChat = {

      title: cleanTitle,

      messages:[]
    };

    allChats.unshift(newChat);

    currentChatIndex = 0;

    renderHistory();
  }

  /* USER MESSAGE */

  createMessage(
    text,
    "user"
  );

  allChats[
    currentChatIndex
  ].messages.push({

    sender:"user",

    text:text,

    time:getTime()
  });

  saveChats();

  userInput.value = "";

  userInput.style.height =
    "56px";

  /* LOADING */

  const loadingBubble =
    createLoadingBubble();

  try{

    const response =
      await fetch("/chat",{

        method:"POST",

        headers:{
          "Content-Type":
            "application/json"
        },

        body:JSON.stringify({
          message:text
        })

      });

    const data =
      await response.json();

    await typeMessage(
      loadingBubble,
      data.reply
    );

    allChats[
      currentChatIndex
    ].messages.push({

      sender:"ai",

      text:data.reply,

      time:getTime()
    });

    saveChats();

  }catch(err){

    loadingBubble.innerHTML =
      "Error getting response.";
  }
}

/* SEND BUTTON */

sendBtn.addEventListener(
  "click",
  sendMessage
);

/* ENTER */

userInput.addEventListener(
  "keydown",
  (e)=>{

    if(
      e.key === "Enter" &&
      !e.shiftKey
    ){

      e.preventDefault();

      sendMessage();
    }

  }
);

/* AUTO HEIGHT */

userInput.addEventListener(
  "input",
  ()=>{

    userInput.style.height =
      "56px";

    userInput.style.height =
      userInput.scrollHeight + "px";

  }
);

/* NEW CHAT BUTTON */

newChatBtn.addEventListener(
  "click",
  startNewChat
);

/* FIRST LOAD */

renderHistory();

startNewChat();