// Priority
// TODO - Add Testing
// TODO - Add Diferencing Statement (difference between learner answer and correct answer)

// TODO - Move API Calls to Flashcard Initialization (1 time, not every time shown)

// TODO - remove temporary stubbings with AJAX calls
// TODO - forvo attribution is required
// TODO - add google virtual keyboard for foreign languages

// Temporary Stubbing

// STUB TODO: put in real request
const MOCK_DATA_FROM_BACKEND = {
    "flashcards": [
      {"en": "ice cream", "sv": "glass"},
      {"en": "candy", "sv": "godis"},
      {"en": "cake", "sv": "kaka"},
      {"en": "chocolate", "sv": "choklad"},
      {"en": "vanilla", "sv": "vanilj"}
    ],
    "currentlyKnownLanguage": "en",
    "currentlyLearningLanguage": "sv"
  }











// SETTINGS //////////////////////////////////////
//////////////////////////////////////////////////
// Flexible Design

// Flashcard Word Image
  // Position
const FLASHCARD_IMAGE_CONTAINER_PERCENT_FROM_TOP = 0.23;
const FLASHCARD_IMAGE_CONTAINER_PERCENT_FROM_LEFT = 0.02;
  // Size
const FLASHCARD_IMAGE_CONTAINER_PERCENT_HEIGHT_OF_FLASHCARD = 0.52;
const FLASHCARD_IMAGE_CONTAINER_PERCENT_WIDTH_OF_FLASHCARD  = 0.32;
// Flashcard Audio Image
const FLASHCARD_SOUND_IMAGE_HEIGHT_RATIO_TO_CONTAINER = 0.2;
const FLASHCARD_SOUND_IMAGE_WIDTH_RATIO_TO_CONTAINER  = 0.13;

// DIV Elements
const FLASHCARD = $('#flashcard');
const FLASHCARD_CONTAINER = $('.flashcard-container');

const KNOWN_WORD_TEXT = $("#known-word");
const LEARNING_WORD_TEXT = $("#learning-word");

const SOUND_IMAGE_IN_FLASHCARD = $('.flashcard-container .flashcard-audio-image');
const PRONUNCIATION_AUDIO = $("#pronunciation");

const USER_ANSWER_FORM = $('#answer-form');
const USER_ANSWER_BOX  = $('#flashcard-answer-box');

const IMAGE_OF_WORD_CONTAINER = $('.learning-word-image-container');
const IMAGE_OF_WORD = $('.learning-word-image');

const NEXT_FLASHCARD_BUTTON = $('#next-flashcard-button');

const FIRST_SCORE_IMAGE = $('#first-score-signal-image');

const COMLETED_DECK_MESSAGE = $('#completed-deck-message');


// APIs
const FORVO_API_URL = "http://apifree.forvo.com/key/78dfafefc36008fe27a6a3a73c340f81/format/json/action/standard-pronunciation/word/";
const MICROSOFT_IMAGE_SEARCH_API_URL = "https://bingapis.azure-api.net/api/v5/images/search?q=";
const AZURE_IMAGE_SEARCH_API_URL = "https://api.datamarket.azure.com/Bing/Search/v1/Image?Query=";
//////////////////////////////////////////////////
//////////////////////////////////////////////////



function serverTerminal() {
  this.getInfoForCurrentStudySessionFromBackend = function() {
    return MOCK_DATA_FROM_BACKEND;
  };
};










function vocabPracticeSession() {
  this.associatedView = null;
  this.serverTerminal = null;

  this.currentKnownLanguage    = null;
  this.currentLearningLanguage = null;

  this.flashcardDeckForSession = null;

  this.currentKnownWord = function() {
    return this.flashcardDeckForSession.currentFlashcard.currentlyKnownWord;
  }.bind(this);
  this.currentLearningWord = function() {
    return this.flashcardDeckForSession.currentFlashcard.currentlyLearningWord;
  }.bind(this);

  this.beginStudy = function() {
    this.digestInitialDataFromServer();
    this.flashcardDeckForSession.selectNextCard();
    this.associatedView.renderNewCard();
  }

  this.digestInitialDataFromServer = function() {
    this.serverTerminal     = new serverTerminal();
    var currentStudySessionData = this.serverTerminal.getInfoForCurrentStudySessionFromBackend();

    this.currentKnownLanguage = this.extractKnownLanguageForCurrentStudySession(currentStudySessionData);
    this.currentLearningLanguage = this.extractLearningLanguageForCurrentStudySession(currentStudySessionData);


    this.flashcardDeckForSession = new flashcardDeckForSession();
    this.flashcardDeckForSession.setVocabPracticeSession(this);
    this.flashcardDeckForSession.digestWordListFromServer(this.extractCardsForCurrentStudySession(currentStudySessionData));
  }

  this.extractCardsForCurrentStudySession = function (currentStudySessionData) {
    return currentStudySessionData.flashcards;
  }

  this.extractKnownLanguageForCurrentStudySession = function (currentStudySessionData) {
    return currentStudySessionData.currentlyKnownLanguage;
  }
  this.extractLearningLanguageForCurrentStudySession = function (currentStudySessionData) {
    return currentStudySessionData.currentlyLearningLanguage;
  }


  this.hasEmptyDeck = function() {
    return (0 === this.flashcardDeckForSession.remainingDeckSize());
  }

  this.judgeLearnerAnswer = function(learnerAnswer) {
    console.log(this.flashcardDeckForSession.flashcardsInDeck);
    var currentLearningWord = this.currentLearningWord().trim();
    console.log(currentLearningWord);
    // correct answer
    if (learnerAnswer === currentLearningWord) {
      FIRST_SCORE_IMAGE.show();
    } else {
      // wrong answer

      this.flashcardDeckForSession.currentFlashcard.timeDue += Math.random() * ((this.flashcardDeckForSession.remainingDeckSize() + 1) * 1000);

      this.flashcardDeckForSession.flashcardsInDeck.push(this.flashcardDeckForSession.currentFlashcard);
    }
  }
}





function flashcardDeckForSession() {
  this.currentFlashcard = null;

  this.flashcardsInDeck   = [];
  this.flashcardsReviewed = [];

  this.remainingDeckSize = function() {
    return this.flashcardsInDeck.length;
  }

  this.selectNextCard = function() {
    this.orderDeckByTimeDue();
    var currentFlashcard = this.flashcardsInDeck.shift();
    this.currentFlashcard = currentFlashcard;
  }

  this.orderDeckByTimeDue = function() {
    this.flashcardsInDeck = this.flashcardsInDeck.sort(function(firstCard, secondCard){
      return (firstCard.timeDue - secondCard.timeDue);
    });
  }


  this.vocabPracticeSession = null;
  this.setVocabPracticeSession = function(vocabPracticeSession) {
    this.vocabPracticeSession = vocabPracticeSession;
  }

  this.digestWordListFromServer = function(dataFromServer) {
    var currentKnownLanguage    = this.vocabPracticeSession.currentKnownLanguage,
        currentLearningLanguage = this.vocabPracticeSession.currentLearningLanguage;
    dataFromServer.forEach(function(wordDataItem, index) {
      var knownWord    = wordDataItem[currentKnownLanguage],
          learningWord = wordDataItem[currentLearningLanguage],
          timeDue      = Date.now() + Math.floor(Math.random() * 1000);
          newFlashcard = new flashcard();

      newFlashcard.currentlyKnownWord    = knownWord;
      newFlashcard.currentlyLearningWord = learningWord;
      newFlashcard.timeDue               = timeDue;
      this.flashcardsInDeck.push(newFlashcard);
    }.bind(this));
  }
}





function flashcard() {
  this.currentlyKnownWord    = null;
  this.currentlyLearningWord = null;

  this.previouslyCorrect     = false;

  this.timeDue               = null;
}










function flashcardView() {
  this.associatedController = null;

  this.initialize = function(vocabPracticeSession) {
    this.associatedController = vocabPracticeSession;
    fitsoundImageInFlashcard();
    sizeFlashcardContainer();
  }

  this.renderNewCard = function() {
    var currentKnownWord  = this.associatedController.currentKnownWord(),
        currentLearningWord = this.associatedController.currentLearningWord()
        currentLearningLanguage = this.associatedController.currentLearningLanguage;

    if (this.associatedController.hasEmptyDeck()) {
      console.log("All done!");
      COMLETED_DECK_MESSAGE.show();
    } else {
      FIRST_SCORE_IMAGE.hide();
      this.setViewForNewCard(currentKnownWord, currentLearningWord);
      this.setAnswerSubmitFormForNewCard(currentLearningWord, currentLearningLanguage);
      this.setNextCardButtonOnBackOfCard();
    }
  }


  this.setViewForNewCard = function(currentKnownWord, currentLearningWord) {
    KNOWN_WORD_TEXT.text(currentKnownWord);
    LEARNING_WORD_TEXT.text(currentLearningWord);
    USER_ANSWER_BOX.focus();
    setVocabImageWithAzure(currentKnownWord);

    FIRST_SCORE_IMAGE.hide();
  }

  this.setAnswerSubmitFormForNewCard = function (currentLearningWord, currentLearningLanguage) {
    USER_ANSWER_FORM.submit(function(event) {
      var userAnswer = USER_ANSWER_BOX.val().trim();

      this.associatedController.judgeLearnerAnswer(userAnswer);

      USER_ANSWER_FORM.off();
      USER_ANSWER_BOX.val("");
      this.handleAnswerSubmissionFromView(event, currentLearningWord, currentLearningLanguage);
    }.bind(this));
  }

  this.setNextCardButtonOnBackOfCard = function () {
    NEXT_FLASHCARD_BUTTON.click(function() {
      NEXT_FLASHCARD_BUTTON.off();
      LEARNING_WORD_TEXT.css({
        "visibility": "hidden"
      });
      this.associatedController.flashcardDeckForSession.selectNextCard();
      FLASHCARD.toggleClass('clicked');
      this.renderNewCard();
    }.bind(this));

    this.handleAnswerSubmissionFromView = function (event, currentLearningWord, currentLearningLanguage) {
      event.preventDefault();
      LEARNING_WORD_TEXT.css({
        "visibility": "visible"
      });
      NEXT_FLASHCARD_BUTTON.focus();
      FLASHCARD.toggleClass('clicked');

      setPronunctiationAudio(currentLearningWord, currentLearningLanguage);
      SOUND_IMAGE_IN_FLASHCARD.click(function() {
        $("#pronunciation").get(0).play();
      });
    }
  }
}



function handleAnswerSubmissionFromView(event, currentLearningWord, currentLearningLanguage) {
  event.preventDefault();
  FLASHCARD.toggleClass('clicked');

  setPronunctiationAudio(currentLearningWord, currentLearningLanguage);
  SOUND_IMAGE_IN_FLASHCARD.click(function() {
    SOUND_IMAGE_IN_FLASHCARD.off();
    $("#pronunciation").get(0).play();
  });
}

























// DOM Manipulation //////////////////////////////
//////////////////////////////////////////////////
$(document).ready( function() {

  var currentStudySession = new vocabPracticeSession();
  var renderedFlashcardView = new flashcardView();

  renderedFlashcardView.initialize(currentStudySession);

  currentStudySession.associatedView = renderedFlashcardView;
  currentStudySession.beginStudy();
});

//////////////////////////////////////////////////
//////////////////////////////////////////////////











// DOM Sizing ////////////////////////////////////
//////////////////////////////////////////////////

function fitsoundImageInFlashcard () {
  var containerHeight  = FLASHCARD_CONTAINER.height(),
      containerWidth   = FLASHCARD_CONTAINER.width();

  var soundImageHeight = containerHeight * FLASHCARD_SOUND_IMAGE_HEIGHT_RATIO_TO_CONTAINER,
      soundImageWidth = containerWidth * FLASHCARD_SOUND_IMAGE_WIDTH_RATIO_TO_CONTAINER;

  SOUND_IMAGE_IN_FLASHCARD.css({
    'min-height': soundImageHeight,
    'max-height': soundImageHeight,
    'min-width': soundImageWidth,
    'max-width': soundImageWidth,

  });
}
function sizeFlashcardContainer() {
  var imageContainers               = IMAGE_OF_WORD_CONTAINER,
      flashcard                   = $(".front-of-flashcard"),

      flashcardHeight = flashcard.height(),
      flashcardWidth  = flashcard.width(),

      imageContainerHeightToFlashcard = FLASHCARD_IMAGE_CONTAINER_PERCENT_HEIGHT_OF_FLASHCARD,
      imageContainerWidthToFlashcard = FLASHCARD_IMAGE_CONTAINER_PERCENT_WIDTH_OF_FLASHCARD,

      imageContainerHeight = flashcardHeight * imageContainerHeightToFlashcard,
      imageContainerWidth  = flashcardWidth * imageContainerWidthToFlashcard,

      imageContainerTop         = flashcardHeight * FLASHCARD_IMAGE_CONTAINER_PERCENT_FROM_TOP,
      imageContainerLeft          = flashcardWidth * FLASHCARD_IMAGE_CONTAINER_PERCENT_FROM_LEFT;

      IMAGE_OF_WORD_CONTAINER.css({
          height:       imageContainerHeight,
          'min-height': imageContainerHeight,
          'max-height': imageContainerHeight,
          width:        imageContainerWidth,
          'min-width':  imageContainerWidth,
          'max-width':  imageContainerWidth,
          top:          imageContainerTop,
          left:         imageContainerLeft
        });
}





function sizeImageWithinContainer(imageElement) {
  var image             = $(imageElement),
      container         = image.parent(),
      containerHeight   = container.height(),
      containerWidth    = container.width(),
      imageStartHeight  = image.prop('naturalHeight'),
      imageStartWidth   = image.prop('naturalWidth'),
      isTooTallNotTooFat,
      shrinkMultiplier,
      imagePixelsFromLeft,
      imagePixelsFromTop,
      imageEndWidth,
      imageEndHeight;

  (containerHeight / imageStartHeight) < (containerWidth / imageStartWidth) ? isTooTallNotTooFat = true : isTooTallNotTooFat = false;

  if (isTooTallNotTooFat) {
    shrinkMultiplier = containerHeight / imageStartHeight;
    imageEndWidth = shrinkMultiplier * imageStartWidth;
    imageEndHeight = shrinkMultiplier * imageStartHeight;
    imagePixelsFromLeft = (containerWidth - imageEndWidth) / 2;
    imagePixelsFromTop = 0;
  } else {
    shrinkMultiplier = containerWidth / imageStartWidth;
    imageEndWidth = shrinkMultiplier * imageStartWidth;
    imageEndHeight = shrinkMultiplier * imageStartHeight;
    imagePixelsFromLeft = 0;
    imagePixelsFromTop = (containerHeight - imageEndHeight) / 2;
  }

  image.width(imageEndWidth);
  image.height(imageEndHeight);

  image.css({
    position: 'relative',
    left: imagePixelsFromLeft + 'px',
    top: imagePixelsFromTop + 'px',
  });

}


//////////////////////////////////////////////////
//////////////////////////////////////////////////





















// Get Forvo Audio  //////////////////////////////
//////////////////////////////////////////////////
function setPronunctiationAudio (wordToPronounce, currentLearningLanguage) {
  var word = wordToPronounce;
  var url = constructForvoAudioRequest(word, currentLearningLanguage);
  ajaxCallToForvo(word, url);
};

function ajaxCallToForvo(word, url) {
  console.log(url);
  console.log(word);
  $.ajax({
      url: url,
      jsonpCallback: "pronounce",
      dataType: "jsonp",
      type: "jsonp",
      success: function (json) {
        ajaxCallToForvo_Success(json);
      },
      error: function(){
        ajaxCallToForvo_Failure();
      }}
  );
}

function ajaxCallToForvo_Success(json) {
  var mp3 = json.items[0].pathmp3;
  var ogg = json.items[0].pathogg;
  PRONUNCIATION_AUDIO.attr({
      'src': mp3,
      'volume': 1,
      'autoplay': 'autoplay'
  });

}

function ajaxCallToForvo_Failure() {
  console.log("error");
}



function constructForvoAudioRequest (wordToPronounce, pronunciationLanguage) {
  var word = encodeURI(wordToPronounce);
  var url = FORVO_API_URL;
  url += word
  url += '/language/';
  url += pronunciationLanguage;
  return url;
};

//////////////////////////////////////////////////
//////////////////////////////////////////////////




















// Get Microsoft Image ////////////////////////////
//////////////////////////////////////////////////
function setVocabImage(word) {
  var word = word;
  var url  = constructMicrosoftImageRequest(word);
  ajaxCallToMicrosoft(url);
}

function ajaxCallToMicrosoft(url) {
  $.ajax({
    method: 'post',
    url: url,
    //Set headers to authorize search with Bing
    headers: {
      'Ocp-Apim-Subscription-Key': '3f18bb3665cf422295ec02530ac4b082'
    },
    success: function(data) {
      ajaxCallToMicrosoft_sucess(data);
    },
    failure: function(err) {
      ajaxCallToMicrosoft_failure(err);
    }
  }).then(function() {
    IMAGE_OF_WORD.on('load', function() {
      IMAGE_OF_WORD.off();
      ajaxCallToMicrosoft_then();
    });
  });
}

function ajaxCallToMicrosoft_sucess(data) {
  var source = data["value"][0]["contentUrl"];
  IMAGE_OF_WORD.attr({
    'src': source
  });
}

function ajaxCallToMicrosoft_failure(err) {
  console.error(err);
}

function ajaxCallToMicrosoft_then() {
  sizeImageWithinContainer(IMAGE_OF_WORD);

}


function constructMicrosoftImageRequest(wordToLearn) {
  var word = encodeURI(wordToLearn);
  var url = MICROSOFT_IMAGE_SEARCH_API_URL;
  url += word;
  url += "&count=1";
  // fill in the next line to change the market to local for language of interest
  // url += "&mkt=___________________________________________________________";

  return url;
}
//////////////////////////////////////////////////
//////////////////////////////////////////////////




























// Get Microsoft Image ////////////////////////////
//////////////////////////////////////////////////
function setVocabImageWithAzure(word) {
  var word = word;
  var url  = constructMicrosoftImageRequestWithAzure(word);
  ajaxCallToMicrosoftWithAzure(url);
}

function ajaxCallToMicrosoftWithAzure(url) {
  $.ajax({
    method: 'post',
    //url: "https://api.datamarket.azure.com/Bing/Search/v1/Image?Query=%27apple%20jacks%27",
     url: url,
    //Set headers to authorize search with Bing
    headers: {
      'Authorization': 'Basic Om5xM1VMUWRBZThndkkyNjJKNG15T3I2TnplRWpkbWxweDJ3Y1lHVVl6NlU='
    },
    success: function(data) {
      ajaxCallToMicrosoftWithAzure_sucess(data);
    },
    failure: function(err) {
      ajaxCallToMicrosoftWithAzure_failure(err);
    }
  }).then(function() {
    IMAGE_OF_WORD.on('load', function() {
      IMAGE_OF_WORD.off();
      ajaxCallToMicrosoftWithAzure_then();
    });
  });
}

function ajaxCallToMicrosoftWithAzure_sucess(data) {

  var source = data.getElementsByTagName("entry")[0].getElementsByTagName("MediaUrl")[0].innerHTML;
  IMAGE_OF_WORD.attr({
    'src': source
  });
}

function ajaxCallToMicrosoftWithAzure_failure(err) {
  console.error(err);
}

function ajaxCallToMicrosoftWithAzure_then() {
  sizeImageWithinContainer(IMAGE_OF_WORD);

}


function constructMicrosoftImageRequestWithAzure(wordToLearn) {
  var word = encodeURI("'" + wordToLearn + "''");
  var url = AZURE_IMAGE_SEARCH_API_URL;
  url += word;
  //url += "&$top=1";
  // fill in the next line to change the market to local for language of interest
  // url += "&mkt=___________________________________________________________";

  return url;
}
//////////////////////////////////////////////////
//////////////////////////////////////////////////
