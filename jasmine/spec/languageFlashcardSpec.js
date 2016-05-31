

describe("vocabPracticeSession", function() {
  var session;

  beforeEach(function() {
    session = new vocabPracticeSession();
  });

  it("gets tested successfully", function() {
    expect(1+1).toEqual(2);
  });



  describe("out of the box", function() {
    it("has no associated view", function() {
      expect(session.associatedView).toBeNull();
    });
    it("has no associated server terminal", function() {
      expect(session.serverTerminal).toBeNull();
    });
    it("has no known language for session", function() {
      expect(session.currentKnownLanguage).toBeNull();
    });

    it("has no learning language for session", function() {
      expect(session.currentLearningLanguage).toBeNull();
    });

    it("has no associated flashcard deck", function() {
      expect(session.flashcardDeckForSession).toBeNull();
    });

    it("cannot return the known word on the current card", function() {
      expect(session.currentKnownWord).toThrowError(TypeError);
    });

    it("cannot return the learning word on the current card", function() {
      expect(session.currentLearningWord).toThrowError(TypeError);
    });
  });





  describe("initialization (begin study)", function() {
    var flashcardView,
        getInfoForCurrentStudySessionFromBackend;

    beforeEach(function() {

      var renderNewCard = jasmine.createSpy('renderNewCard');
      session.associatedView = {
        renderNewCard: function() {
            renderNewCard();
        }
      }
      spyOn(window, 'serverTerminal').and.callFake(function() {
        this.getInfoForCurrentStudySessionFromBackend = function() {
            return {
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
        };
      });

      session.beginStudy();
    });

    it("has knowledge of a server terminal", function() {
      expect(session.serverTerminal).toEqual(jasmine.any(serverTerminal));
    });

    it("now has a known language", function() {
      expect(session.currentKnownLanguage).toEqual("en");
    });

    it("now has a language to learn", function() {
      expect(session.currentLearningLanguage).toEqual("sv");
    });

    it("now has a flashcard deck to study", function() {
      expect(session.flashcardDeckForSession).toEqual(jasmine.any(flashcardDeckForSession));
    });

    it("has alerted the view to show the new card", function() {
      expect(renderNewCard.calls.count()).toEqual(1);
    });
  });


});

describe("serverTerminal", function() {

});

describe("flashcardView", function() {

});
