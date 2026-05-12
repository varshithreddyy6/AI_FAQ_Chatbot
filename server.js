const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(cors());

app.use(express.json());

app.use(express.static(__dirname));

/* OPENROUTER */

const API_KEY =
  process.env.OPENROUTER_API_KEY;

/* CHAT API */

app.post("/chat", async (req,res)=>{

  try{

    const userMessage =
      req.body.message;

    const response =
      await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {

          method:"POST",

          headers:{
            "Authorization":
              `Bearer ${API_KEY}`,

            "Content-Type":
              "application/json"
          },

          body:JSON.stringify({

            model:
              "deepseek/deepseek-chat-v3-0324:free",

            messages:[
              {
                role:"user",
                content:userMessage
              }
            ]

          })

        }
      );

    const data =
      await response.json();

    const reply =
      data.choices?.[0]?.message?.content
      ||
      "No response.";

    res.json({
      reply
    });

  }catch(error){

    console.log(error);

    res.json({
      reply:
        "Error getting response."
    });

  }

});

/* START SERVER */

const PORT =
  process.env.PORT || 3000;

app.listen(PORT, ()=>{

  console.log(
    `Server running on port ${PORT}`
  );

});