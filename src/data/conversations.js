// Interactive scenario-based conversation missions with branching paths
// 6 Real-life scenarios reflecting authentic everyday life in Tamil Nadu

export const CONVERSATIONS = [
  {
    id: "restaurant",
    title: "Ordering Food at a Mess",
    tamilTitle: "உணவகத்தில் ஆர்டர் செய்தல்",
    description: "You've walked into a bustling Chennai tiffin mess during breakfast hour. Order your meal, request accompaniments, and settle the bill.",
    initialNode: "step-1",
    nodes: {
      "step-1": {
        speaker: "Server (அண்ணா)",
        tamil: "வணக்கம் தம்பி! என்ன வேணும்? இட்லி, தோசை, பூரி சூடா இருக்கு.",
        romanized: "Vanakkam thambi! Enna venum? Idli, dosai, poori soodaa irukku.",
        english: "Welcome! What would you like? Idlis, dosas, and pooris are hot and fresh.",
        context: "The server wipes your table and waits with his notepad.",
        options: [
          {
            tamil: "ரெண்டு இட்லி, ஒரு வடை கொடுங்க.",
            romanized: "Rendu idli, oru vadai kodunga.",
            english: "Two idlis, one vada please.",
            feedback: "Perfect traditional South Indian order! Balanced and straightforward.",
            nextNode: "step-2a"
          },
          {
            tamil: "ஒரு மசால் தோசை கொடுங்க, காரம் கம்மியா.",
            romanized: "Oru masala dosai kodunga, kaaram kammiyaa.",
            english: "One masala dosa please, make it less spicy.",
            feedback: "Smart move specifying 'kaaram kammiyaa' to avoid fiery red chili chutney inside.",
            nextNode: "step-2b"
          },
          {
            tamil: "சாப்பாடு ரெடியா அண்ணா?",
            romanized: "Saappaadu ready-aa anna?",
            english: "Are meals ready, brother?",
            feedback: "It's morning tiffin time! Full meals (rice thali) usually only start after 12:30 PM.",
            nextNode: "step-2c"
          }
        ]
      },
      "step-2a": {
        speaker: "Server",
        tamil: "இதோ இட்லி, வடை. சாம்பார், தேங்காய் சட்னி, கார சட்னி இருக்கு. காபி சாப்பிடறீங்களா?",
        romanized: "Idho idli, vadai. Saambaar, thengai chutney, kaara chutney irukku. Kaapi saapidreengalaa?",
        english: "Here are idlis and vada. We have sambar, coconut chutney, and spicy chutney. Will you have coffee?",
        context: "Hot steam rises from the soft jasmine-like idlis.",
        options: [
          {
            tamil: "ஆமா அண்ணா, ஒரு ஃபில்டர் காபி கொடுங்க, சர்க்கரை கம்மியா.",
            romanized: "Aama anna, oru filter kaapi kodunga, sarkarai kammiyaa.",
            english: "Yes brother, one filter coffee, with less sugar.",
            feedback: "Excellent! Tamil filter coffee has a legendary rich aroma and frothy chicory blend.",
            nextNode: "step-3"
          },
          {
            tamil: "காபி வேண்டாம், குடிக்க தண்ணீர் மட்டும் கொடுங்க.",
            romanized: "Kaapi vendaam, kudikka thanneer mattum kodunga.",
            english: "No coffee, just drinking water please.",
            feedback: "Polite and clear refusal using 'vendaam' (don't want).",
            nextNode: "step-3"
          }
        ]
      },
      "step-2b": {
        speaker: "Server",
        tamil: "சரிங்க, மொறு மொறு மசால் தோசை அஞ்சு நிமிஷத்துல வரும்.",
        romanized: "Saringa, moru moru masala dosai anju nimishathula varum.",
        english: "Alright, crisp hot masala dosa will arrive in 5 minutes.",
        context: "The master chef spreads the fermented batter on a massive smoking iron tawa.",
        options: [
          {
            tamil: "நன்றி அண்ணா! கூட கொஞ்சம் சாம்பார் அதிகமா குடுங்க.",
            romanized: "Nandri anna! Kooda konjam saambaar adhigamaa kudunga.",
            english: "Thank you brother! Also please give a little extra sambar.",
            feedback: "Very common request in Tamil Nadu—locals love extra piping hot drumstick sambar!",
            nextNode: "step-3"
          }
        ]
      },
      "step-2c": {
        speaker: "Server",
        tamil: "மத்தியானம் 12:30 மணிக்கு தான் சாப்பாடு கிடைக்கும் தம்பி. இப்போ டிபன் தான் இருக்கு.",
        romanized: "Madhyaanam 12:30 manikku dhaan saappaadu kidaikkum thambi. Ippo tiffin dhaan irukku.",
        english: "Meals are only served from 12:30 PM. Right now we only have tiffin items.",
        context: "He points to the freshly stacked banana leaves and morning batter pots.",
        options: [
          {
            tamil: "சரி அண்ணா, அப்போ ஒரு நெய் ரோஸ்ட் தோசை கொடுங்க.",
            romanized: "Sari anna, appo oru ghee roast dosai kodunga.",
            english: "Alright brother, then please give one ghee roast dosa.",
            feedback: "Quick adaptation! Ghee roast is delicious, crispy, and universally loved.",
            nextNode: "step-3"
          }
        ]
      },
      "step-3": {
        speaker: "Server",
        tamil: "சாப்பிட்டாச்சா தம்பி? எல்லாம் நல்லா இருந்ததா?",
        romanized: "Saapittaachaa thambi? Ellaam nallaa irundhadhaa?",
        english: "Finished eating? Was everything good?",
        context: "You wipe your hands at the washbasin and return to settle up.",
        options: [
          {
            tamil: "சாப்பாடு ரொம்ப ருசியா இருந்தது! பில் கொண்டு வாங்க.",
            romanized: "Saappaadu romba rusiyaa irundhadhu! Bill kondu vaanga.",
            english: "The food was very delicious! Please bring the bill.",
            feedback: "Giving a genuine compliment ('rusiyaa irundhadhu') always brightens the crew's day.",
            nextNode: "step-4"
          },
          {
            tamil: "பில் எங்கே கொடுக்கணும்? ஜிபே இருக்கா?",
            romanized: "Bill engae kodukkanum? GPay irukkaa?",
            english: "Where should I pay the bill? Do you have GPay?",
            feedback: "Practical and modern! Most messes take payment at the front counter ('cashier').",
            nextNode: "step-4"
          }
        ]
      },
      "step-4": {
        speaker: "Cashier",
        tamil: "மொத்தம் 85 ரூபாய் தம்பி. QR கோடு ஸ்கேன் பண்ணிக்கோங்க.",
        romanized: "Motham 85 roobai thambi. QR code scan pannikkonga.",
        english: "Total is 85 rupees. You can scan the QR code.",
        context: "The cashier shows the UPI QR code on the desktop.",
        options: [
          {
            tamil: "பணம் அனுப்பிட்டேன் அண்ணா. ரொம்ப நன்றி, போயிட்டு வர்றேன்!",
            romanized: "Panam anuppitten anna. Romba nandri, poittu varren!",
            english: "I have sent the payment brother. Thank you very much, goodbye!",
            feedback: "Mission accomplished! You used traditional polite leave-taking 'poittu varren'. Excellent job!",
            isEnd: true,
            success: true
          }
        ]
      }
    }
  },
  {
    id: "auto",
    title: "Hailing an Auto-Rickshaw",
    tamilTitle: "ஆட்டோ பிடித்தல்",
    description: "You need an auto-rickshaw to travel from the bus terminus to your university campus. Agree on a route and fair fare.",
    initialNode: "step-1",
    nodes: {
      "step-1": {
        speaker: "Auto Driver (அண்ணா)",
        tamil: "எங்கே போகணும் தம்பி? ஆட்டோ வேணுமா?",
        romanized: "Engae poganum thambi? Auto venumaa?",
        english: "Where do you need to go? Need an auto?",
        context: "You stand by the roadside with your backpack.",
        options: [
          {
            tamil: "அண்ணா, யுனிவர்சிட்டி கேம்பஸ் போவீங்களா? மீட்டர் போடுவீங்களா?",
            romanized: "Anna, university campus poveengalaa? Meter poduveengalaa?",
            english: "Brother, will you go to the university campus? Will you put the meter?",
            feedback: "Great practice! Polite address ('Anna') and asking for the meter right away.",
            nextNode: "step-2a"
          },
          {
            tamil: "அண்ணா, யுனிவர்சிட்டி போக எவ்வளவு ஆகும்?",
            romanized: "Anna, university poga evvalavu aagum?",
            english: "Brother, how much will it cost to go to university?",
            feedback: "Direct and practical. In many cities drivers prefer a fixed negotiated fare over meter.",
            nextNode: "step-2b"
          }
        ]
      },
      "step-2a": {
        speaker: "Auto Driver",
        tamil: "மீட்டர்ல வர்றதுக்கு டிராபிக் அதிகமா இருக்கு தம்பி. 150 ரூபாய் குடுங்க, போலாம்.",
        romanized: "Meter-la varradhukku traffic adhigamaa irukku thambi. 150 roobai kudunga, polaam.",
        english: "Heavy traffic right now to run on meter. Give 150 rupees and let's go.",
        context: "He quotes 150 rupees, which is about 30 rupees above normal.",
        options: [
          {
            tamil: "150 ரொம்ப அதிகம் அண்ணா. 100 ரூபாய்க்கு வருவீங்களா?",
            romanized: "150 romba adhigam anna. 100 roobaaykku varuveengalaa?",
            english: "150 is too much brother. Will you come for 100 rupees?",
            feedback: "Reasonable counter-offer with calm and friendly negotiation tone.",
            nextNode: "step-3"
          },
          {
            tamil: "சரி அண்ணா, சீக்கிரம் போங்க.",
            romanized: "Sari anna, seekkiram ponga.",
            english: "Alright brother, please go fast.",
            feedback: "You accepted without bargaining. Faster, but good to try negotiating next time!",
            nextNode: "step-4"
          }
        ]
      },
      "step-2b": {
        speaker: "Auto Driver",
        tamil: "அங்கயா? 140 ரூபாய் ஆகும் தம்பி.",
        romanized: "Angayaa? 140 roobai aagum thambi.",
        english: "Over there? That will be 140 rupees.",
        context: "He pulls up beside the curb.",
        options: [
          {
            tamil: "கொஞ்சம் குறைச்சு 110 ரூபாய்க்கு வாங்க அண்ணா.",
            romanized: "Konjam kuraichu 110 roobaaykku vaanga anna.",
            english: "Please reduce a bit and come for 110 rupees brother.",
            feedback: "Polite negotiation phrasing using 'konjam kuraichu' (reduce a bit).",
            nextNode: "step-3"
          }
        ]
      },
      "step-3": {
        speaker: "Auto Driver",
        tamil: "சரி வாங்க தம்பி, 120 ரூபாய் போட்டுக்கோங்க. வண்டியில ஏறுங்க.",
        romanized: "Sari vaanga thambi, 120 roobai pottukkonga. Vandiyila erunga.",
        english: "Alright come, make it 120 rupees. Hop in the vehicle.",
        context: "A fair middle ground is reached! You climb in.",
        options: [
          {
            tamil: "சரி அண்ணா, மெயின் கேட் பக்கத்துல நிறுத்துங்க.",
            romanized: "Sari anna, main gate pakkathula niruthunga.",
            english: "Alright brother, please stop near the main gate.",
            feedback: "Clear landmark specification so the driver knows where to drop you.",
            nextNode: "step-4"
          }
        ]
      },
      "step-4": {
        speaker: "Auto Driver",
        tamil: "தம்பி, கேட் வந்துடுச்சு. இங்கே நிறுத்தவா?",
        romanized: "Thambi, gate vandhuduchu. Ingae niruthavaa?",
        english: "We reached the gate. Shall I stop right here?",
        context: "The auto decelerates by the curb outside the campus entrance.",
        options: [
          {
            tamil: "ஆமா அண்ணா, இங்கே நிறுத்துங்க. இந்தாங்க பணம், நன்றி!",
            romanized: "Aama anna, ingae niruthunga. Indhaanga panam, nandri!",
            english: "Yes brother, stop right here. Here is the money, thank you!",
            feedback: "Mission completed successfully! Safe and polite ride navigation.",
            isEnd: true,
            success: true
          }
        ]
      }
    }
  },
  {
    id: "shopping",
    title: "Bargaining at the Market",
    tamilTitle: "சந்தையில் பொருட்கள் வாங்குதல்",
    description: "Purchase fresh mangoes or vegetables at an open bazaar. Ask prices, verify quality, and pay by UPI.",
    initialNode: "step-1",
    nodes: {
      "step-1": {
        speaker: "Fruit Seller (அக்கா)",
        tamil: "வாங்க தம்பி! நல்ல நாட்டு மாம்பழம், அல்போன்சா எல்லாம் இருக்கு. என்ன வேணும்?",
        romanized: "Vaanga thambi! Nalla naattu maambazham, Alphonso ellaam irukku. Enna venum?",
        english: "Welcome! We have good country mangoes and Alphonsos. What do you need?",
        context: "Fragrant stacks of golden mangoes fill the wooden cart.",
        options: [
          {
            tamil: "அக்கா, இந்த மாம்பழம் ஒரு கிலோ எவ்வளவு?",
            romanized: "Akka, indha maambazham oru kilo evvalavu?",
            english: "Sister, how much for one kilo of these mangoes?",
            feedback: "Warm and respectful address ('Akka' = elder sister) used universally with women vendors.",
            nextNode: "step-2"
          },
          {
            tamil: "இது நல்லா இனிப்பா இருக்குமா?",
            romanized: "Idhu nallaa inippaa irukkumaa?",
            english: "Will this be nicely sweet?",
            feedback: "Great practical question! 'Inippu' means sweetness.",
            nextNode: "step-2"
          }
        ]
      },
      "step-2": {
        speaker: "Fruit Seller",
        tamil: "ரொம்ப தேன் மாதிரி இனிக்கும் தம்பி! கிலோ 120 ரூபாய் தான். ரெண்டு கிலோ போடவா?",
        romanized: "Romba thean maadhiri inikkum thambi! Kilo 120 roobai dhaan. Rendu kilo podavaa?",
        english: "Sweet like pure honey! Only 120 rupees per kilo. Shall I weigh two kilos?",
        context: "She holds the weighing scale ready.",
        options: [
          {
            tamil: "கொஞ்சம் விலை குறைச்சு 100 ரூபாய்க்கு கொடுங்க அக்கா, ரெண்டு கிலோ வாங்கிக்கிறேன்.",
            romanized: "Konjam vilai kuraichu 100 roobaaykku kodunga akka, rendu kilo vaangikkiren.",
            english: "Please reduce the price a little to 100 rupees sister, I will take two kilos.",
            feedback: "Terrific market bargaining: offering to buy volume in exchange for a modest price drop.",
            nextNode: "step-3"
          },
          {
            tamil: "எனக்கு ஒரு கிலோ மட்டும் போதும் அக்கா.",
            romanized: "Enakku oru kilo mattum podhum akka.",
            english: "One kilo is enough for me sister.",
            feedback: "'Podhum' (enough) is one of the most useful everyday Tamil words.",
            nextNode: "step-3"
          }
        ]
      },
      "step-3": {
        speaker: "Fruit Seller",
        tamil: "சரி தம்பி, உங்களுக்காக 100 ரூபாய் போட்டு ரெண்டு கிலோ பேக் பண்ணிட்டேன். ஒரு பை வேணுமா?",
        romanized: "Sari thambi, ungalukkaaga 100 roobai pottu rendu kilo pack pannitten. Oru pai venumaa?",
        english: "Alright, just for you I gave it for 100 rs and packed two kilos. Need a bag?",
        context: "She holds out the bag of ripe fruit.",
        options: [
          {
            tamil: "என்கிட்ட துணிப் பை இருக்கு அக்கா. ஜிபே க்யூஆர் கோடு கொடுங்க.",
            romanized: "Enkitta thuni pai irukku akka. GPay QR code kodunga.",
            english: "I have a cloth bag with me sister. Please show the GPay QR code.",
            feedback: "Eco-friendly and digitally savvy! She points to her phone QR code with a smile.",
            nextNode: "step-4"
          }
        ]
      },
      "step-4": {
        speaker: "Fruit Seller",
        tamil: "பணம் வந்துடுச்சு தம்பி. சாப்பிட்டு பாத்துட்டு மறுபடியும் வாங்க!",
        romanized: "Panam vandhuduchu thambi. Saappittu paathuttu marubadiyum vaanga!",
        english: "Payment received. Taste them and come back again!",
        context: "You take your bag of fresh fruit.",
        options: [
          {
            tamil: "கண்டிப்பா வர்றேன் அக்கா! ரொம்ப நன்றி, போயிட்டு வர்றேன்.",
            romanized: "Kandippaa varren akka! Romba nandri, poittu varren.",
            english: "I will definitely come back sister! Thank you very much, goodbye.",
            feedback: "Mission completed with 100% genuine local etiquette!",
            isEnd: true,
            success: true
          }
        ]
      }
    }
  },
  {
    id: "classmate",
    title: "Introducing Yourself to a Classmate",
    tamilTitle: "வகுப்பு தோழரிடம் அறிமுகம்",
    description: "Break the ice with a fellow student sitting next to you before an engineering lecture begins.",
    initialNode: "step-1",
    nodes: {
      "step-1": {
        speaker: "Classmate",
        tamil: "ஹலோ! இந்த சீட் காலியா இருக்கா? உட்காரலாமா?",
        romanized: "Hello! Indha seat kaaliyaa irukkaa? Utkaaralaamaa?",
        english: "Hello! Is this seat vacant? May I sit down?",
        context: "A friendly classmate carrying a notebook approaches your bench.",
        options: [
          {
            tamil: "ஆமா, காலியா தான் இருக்கு. வாங்க, உட்காருங்க!",
            romanized: "Aama, kaaliyaa dhaan irukku. Vaanga, utkaarunga!",
            english: "Yes, it is empty. Come, please sit!",
            feedback: "Warm and inviting response using polite 'vaanga, utkaarunga'.",
            nextNode: "step-2"
          }
        ]
      },
      "step-2": {
        speaker: "Classmate",
        tamil: "நன்றி! என் பேரு கார்த்திக். நீங்க புதுசா? உங்க பேரு என்ன?",
        romanized: "Nandri! En peru Karthik. Neenga pudhusaa? Unga peru enna?",
        english: "Thanks! My name is Karthik. Are you new here? What is your name?",
        context: "He extends a hand to introduce himself.",
        options: [
          {
            tamil: "என் பேரு டேனியல். நான் வேற மாநிலத்திலிருந்து வந்திருக்கேன். உங்களை பார்த்ததில் சந்தோஷம்!",
            romanized: "En peru Daniel. Naan vera maanilathilirundhu vandhirukken. Ungalai paarthadhil sandhosham!",
            english: "My name is Daniel. I came from another state. Nice to meet you!",
            feedback: "Fantastic! Full polite introduction covering name, background, and pleasantries.",
            nextNode: "step-3"
          }
        ]
      },
      "step-3": {
        speaker: "Classmate",
        tamil: "ரொம்ப சந்தோஷம் டேனியல்! தமிழ் நல்லா பேசுறீங்களே! காலேஜ் கேம்பஸ் பிடிச்சிருக்கா?",
        romanized: "Romba sandhosham Daniel! Thamizh nallaa pesureengalae! College campus pidichirukkaa?",
        english: "Very glad to meet you Daniel! You speak Tamil so well! Do you like the college campus?",
        context: "He looks impressed and interested.",
        options: [
          {
            tamil: "எனக்கு கொஞ்சம் தமிழ் தான் தெரியும், இப்போ தான் கத்துக்கிறேன். கேம்பஸ் ரொம்ப பெருசா இருக்கு!",
            romanized: "Enakku konjam thamizh dhaan theriyum, ippo dhaan katthukkiren. Campus romba perusaa irukku!",
            english: "I only know a little Tamil, just learning now. The campus is very big!",
            feedback: "Humble, genuine, and encouraging! Locals appreciate learners putting in effort.",
            nextNode: "step-4"
          }
        ]
      },
      "step-4": {
        speaker: "Classmate",
        tamil: "சூப்பர்! கிளாஸ் முடிஞ்சதும் கேண்டீன் போலாமா? ஒரு டீ சாப்பிட்டு பேசலாம்.",
        romanized: "Super! Class mudinjadhum canteen polaamaa? Oru tea saappittu pesalaam.",
        english: "Super! After class finishes shall we go to the canteen? We can have tea and chat.",
        context: "The professor enters the hall with the lecture slides.",
        options: [
          {
            tamil: "கண்டிப்பா போலாம்! சரி, சார் வந்துட்டாரு, கிளாஸ் கவனிக்கலாம்.",
            romanized: "Kandippaa polaam! Sari, sir vandhuttaaru, class kavanikkalaam.",
            english: "Definitely let's go! Alright, sir has arrived, let's pay attention to class.",
            feedback: "Mission completed! You made a genuine campus friend and handled the conversation smoothly.",
            isEnd: true,
            success: true
          }
        ]
      }
    }
  },
  {
    id: "directions",
    title: "Asking for Directions on Foot",
    tamilTitle: "தெருவில் வழி கேட்டல்",
    description: "You're trying to find a pharmacy or clinic in an unfamiliar neighbourhood. Ask a pedestrian for guidance.",
    initialNode: "step-1",
    nodes: {
      "step-1": {
        speaker: "Pedestrian (பெரியவர்)",
        tamil: "தம்பி, என்ன தேடுறீங்க? உதவி வேணுமா?",
        romanized: "Thambi, enna thedureenga? Udhavi venumaa?",
        english: "Son, what are you looking for? Do you need help?",
        context: "An elderly gentleman with an umbrella notices you looking around at the crossroad.",
        options: [
          {
            tamil: "வணக்கம் ஐயா. பக்கத்துல மெடிக்கல் ஷாப் எங்கே இருக்கு?",
            romanized: "Vanakkam aiya. Pakkathula medical shop engae irukku?",
            english: "Greetings sir. Where is a medical shop / pharmacy nearby?",
            feedback: "'Aiya' is a very respectful title for elderly gentlemen.",
            nextNode: "step-2"
          }
        ]
      },
      "step-2": {
        speaker: "Pedestrian",
        tamil: "இங்கே இருந்து நேரா போங்க. சிக்னல் வரும், அங்க வலது பக்கம் திரும்புங்க. அப்போ அப்போலோ பார்மசி தெரியும்.",
        romanized: "Ingae irundhu neeraa ponga. Signal varum, anga valadhu pakkam thirumbunga. Appo Apollo pharmacy theriyum.",
        english: "Go straight from here. A traffic signal will come, turn right there. You will see Apollo pharmacy.",
        context: "He gestures with his hand pointing towards the traffic lights.",
        options: [
          {
            tamil: "இங்கிருந்து நடந்து போக முடியுமா ஐயா? எவ்வளவு நேரம் ஆகும்?",
            romanized: "Ingirundhu nadandhu poga mudiyumaa aiya? Evvalavu neram aagum?",
            english: "Can I walk from here sir? How much time will it take?",
            feedback: "Great clarifying question to confirm distance before walking.",
            nextNode: "step-3"
          }
        ]
      },
      "step-3": {
        speaker: "Pedestrian",
        tamil: "ரொம்ப பக்கம்தான் தம்பி, அஞ்சு நிமிஷம் நடந்தா போதும்.",
        romanized: "Romba pakkamdhaan thambi, anju nimisham nadandhaa podhum.",
        english: "It is very close, a five-minute walk is enough.",
        context: "He smiles reassuringly.",
        options: [
          {
            tamil: "ரொம்ப நன்றி ஐயா! போய் மருந்து வாங்கிக்கிறேன்.",
            romanized: "Romba nandri aiya! Poi marundhu vaangikkiren.",
            english: "Thank you very much sir! I will go buy the medicine.",
            feedback: "Mission completed! Clear directional understanding achieved.",
            isEnd: true,
            success: true
          }
        ]
      }
    }
  },
  {
    id: "hostel",
    title: "Speaking to the Hostel Warden",
    tamilTitle: "விடுதி காப்பாளரிடம் பேசுதல்",
    description: "Report a water supply issue in your hostel room and ask about curfew permissions for weekend study.",
    initialNode: "step-1",
    nodes: {
      "step-1": {
        speaker: "Hostel Warden",
        tamil: "சொல்லுங்க, என்ன விஷயம்? ரூம் நம்பர் என்ன?",
        romanized: "Sollunga, enna vishayam? Room number enna?",
        english: "Tell me, what is the matter? What is your room number?",
        context: "The warden looks up from the hostel register logbook.",
        options: [
          {
            tamil: "வணக்கம் சார். ரூம் 204-ல தண்ணி வரல, கொஞ்சம் பாக்க முடியுமா?",
            romanized: "Vanakkam sir. Room 204-la thanni varala, konjam paakka mudiyumaa?",
            english: "Greetings sir. Water is not coming in room 204, could you please take a look?",
            feedback: "Clear and courteous reporting of maintenance problem.",
            nextNode: "step-2"
          }
        ]
      },
      "step-2": {
        speaker: "Hostel Warden",
        tamil: "மோட்டார்ல சின்ன பிரச்சனை. பிளம்பர் இப்போ வந்துடுவாரு, சரி பண்ணிடலாம்.",
        romanized: "Motor-la chinna pirachanai. Plumber ippo vandhuduvaaru, sari pannidalaam.",
        english: "Minor issue with the pump motor. The plumber will arrive shortly and fix it.",
        context: "He notes room 204 in the maintenance book.",
        options: [
          {
            tamil: "சரிங்க சார், நன்றி. இன்னைக்கு ராத்திரி லைப்ரரி போயிட்டு 9 மணிக்கு வர அனுமதி உண்டா?",
            romanized: "Saringa sir, nandri. Innaikku raathiri library poittu 9 manikku vara anumadhi undaa?",
            english: "Alright sir, thank you. Is permission granted to return at 9 PM from the library tonight?",
            feedback: "Polite curfew extension inquiry using 'anumadhi undaa' (is there permission?).",
            nextNode: "step-3"
          }
        ]
      },
      "step-3": {
        speaker: "Hostel Warden",
        tamil: "ரிஜிஸ்டர்ல உங்க பேரு, ஐடி கார்டு நம்பர் எழுதிட்டு போங்க தம்பி. பத்திரமா வாங்க.",
        romanized: "Register-la unga peru, ID card number ezhudhittu ponga thambi. Pathiramaa vaanga.",
        english: "Write your name and ID card number in the out-pass register. Come back safely.",
        context: "He turns the gate out-pass book toward you with a pen.",
        options: [
          {
            tamil: "எழுதிட்டேன் சார். ரொம்ப நன்றி!",
            romanized: "Ezhudhitten sir. Romba nandri!",
            english: "I have written it sir. Thank you very much!",
            feedback: "Mission completed! Issue logged and late-pass secured with flawless communication.",
            isEnd: true,
            success: true
          }
        ]
      }
    }
  }
];

export function getConversationById(id) {
  return CONVERSATIONS.find(c => c.id === id);
}
