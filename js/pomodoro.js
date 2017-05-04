$(document).ready(function() {

    var keyframes = {
        // Establish reference to css stylesheet
        sheet: document.styleSheets[0],

        add: function(str) {
            keyframes.sheet.insertRule(str, 0);
        },
        remove: function(repeat) {
            for (var x = 0; x < repeat; x++) {
                keyframes.sheet.deleteRule(0);
            }
        }
    };

    var controlCenter = {
        playTime: {
            value: 5,
            increase: function() {
                controlCenter.playTime.value += 5;
            },
            decrease: function() {
                if (controlCenter.playTime.value >= 10) {
                    controlCenter.playTime.value -= 5;
                }
            },
            update: function() {
                $(".play-time-text").html(controlCenter.playTime.value);
            },

            get: function() {
                return controlCenter.playTime.value;
            }
        },
        workTime: {
            value: 25,
            increase: function() {
                controlCenter.workTime.value += 5;
            },
            decrease: function() {
                if (controlCenter.workTime.value >= 10) {
                    controlCenter.workTime.value -= 5;
                }
            },
            update: function() {
                $(".work-time-text").html(controlCenter.workTime.value);
            },
            get: function() {
                return controlCenter.workTime.value;
            }
        },
        toggleControlButton: function() {
            if (clock.state) {
                if (clock.paused) {
                    $(".pause").hide();
                    $(".start").show();
                } else {
                    $(".pause").show();
                    $(".start").hide();
                }
            } else if (!clock.state) {
                $(".pause").hide();
                $(".start").show();
            }

        },

        toggleHighlightBar: function() {
            if (clock.mode === "work") {
                $(".work-label").addClass("highlight");
                $(".play-label").removeClass("highlight");
            } else if (clock.mode === "play") {
                $(".play-label").addClass("highlight");
                $(".work-label").removeClass("highlight");
            }
        },

        switchboard: function() {
            if (clock.state) {
                if (clock.paused) {
                    clock.resume();
                } else {
                    clock.pause();
                }
            } else if (!clock.state) {
                messageCenter.hideAll();
                cycle.increment();
                clock.setClockTime();
            }
        }
    };

    var chimes = {
        chimeAudio: new Audio("img/Cartoon Trill.mp3"),
        play: function() {
            chimes.chimeAudio.play();
        },
        animate: function() {
            chimes.play();
            for (var i = 0; i < 10; i++) {
                $(".hammer").animate({
                    left: "-=8px",
                }, 55, function() {
                    $(".hammer").css("transform", "rotate(-30deg)");
                    $(".bell-one").css("animation", "ring1 200ms infinite");
                    $(".bell-two").css("animation", "ring2 200ms infinite");
                });

                $(".hammer").animate({
                    left: "+=8px",
                }, 55, function() {
                    $(".hammer").css("transform", "rotate(0deg)");
                });

                $(".hammer").animate({
                    left: "+=8px",
                }, 55, function() {
                    $(".hammer").css("transform", "rotate(30deg)");
                });

                $(".hammer").animate({
                    left: "-=8px",
                }, 55, function() {
                    $(".hammer").css("transform", "rotate(0deg)");
                    $(".bell-one").css("animation", "none");
                    $(".bell-two").css("animation", "none");
                });
            }
        }
    };

    var clock = {

        state: false,
        paused: false,
        mode: "work",
        time: 0,
        timeElapsed: 0,
        startTime: 0,
        stopTime: 0,
        clockEvent: 0,

        toggleClockState: function() {
            clock.state = !clock.state;
            console.log("clock.state " + clock.state);
        },

        toggleClockMode: function() {
            if (clock.mode === "work") {
                clock.mode = "play";
            } else {
                clock.mode = "work";
            }
            console.log("clock.mode " + clock.mode);
            controlCenter.toggleHighlightBar();
        },

        togglePause: function() {
            clock.paused = !clock.paused;
            console.log("clock.paused " + clock.paused);
        },
        

        setClockTime: function() {
            if (clock.mode === "work") {
                clock.time = controlCenter.workTime.get();
            } else if (clock.mode === "play") {
                clock.time = controlCenter.playTime.get();
            }
            clock.wind();
        },

        wind: function() {
            // If there is a reminder event active, clear it
            reminder.clear();

            // Add @keyframes statements for wind motion
            keyframes.add(clock.minuteHand.wind.getKeyframes());
            keyframes.add(clock.secondHand.wind.getKeyframes());
            // Add wind class to elements, start animation
            clock.minuteHand.startAnimation("minute-hand-wind");
            clock.secondHand.startAnimation("second-hand-wind");
            // Wait for animation to stop
            window.setTimeout(function() {
                // Set position of minute hand
                clock.minuteHand.setPositionClass(true);
                    // Remove @keyframes statements from wind motion
                keyframes.remove(2);
                // Remove wind class from elements
                clock.minuteHand.stopAnimation("minute-hand-wind");
                clock.secondHand.stopAnimation("second-hand-wind");
                clock.unwind();
            }, 4000);

        },

        unwind: function() {

            clock.toggleClockState();

            keyframes.add(clock.minuteHand.unwind.getKeyframes());

            clock.minuteHand.startAnimation("minute-hand-unwind");
            clock.secondHand.startAnimation("second-hand-unwind");

            clock.startTime = Date.now();

            // Wait for animation to stop
            clock.clockEvent = window.setTimeout(clock.end, 60000 * clock.time);

            // replace with toggle control
            controlCenter.toggleControlButton();
        },

        pause: function() {
            clock.togglePause();

            clock.stopTime = Date.now()

            window.clearTimeout(clock.clockEvent);

            clock.minuteHand.togglePause();
            clock.secondHand.togglePause();

            controlCenter.toggleControlButton();

            clock.timeElapsed += (clock.stopTime - clock.startTime)


        },

        resume: function() {
            clock.togglePause();

            clock.minuteHand.togglePause();
            clock.secondHand.togglePause();

            clock.startTime = Date.now();
            clock.clockEvent = window.setTimeout(clock.end, (60000 * clock.time) - clock.timeElapsed);
            controlCenter.toggleControlButton();

        },

        end: function() {

            // Remove @keypoints statement from unwind motion
            keyframes.remove(1);

            // Remove unwind class from elements
            clock.minuteHand.stopAnimation("minute-hand-unwind");
            clock.secondHand.stopAnimation("second-hand-unwind");

            // Remove position class from minute hand, reset
            clock.minuteHand.setPositionClass(false);

            clock.toggleClockState();
            clock.toggleClockMode();
            if (snooze.state) {
                snooze.hideAnimation();
                snooze.toggleSnoozeState();
            } else {
                if (cycle.get() < 4) {
                    cycle.complete();                  
                } else {
                    cycle.reset();                 
                }
            }
            chimes.animate();
            controlCenter.toggleControlButton();
            reminder.set();
            messageCenter.displayNextStep(clock.mode);
        },

        recieveSnooze: function(minutes) {
            clock.time = minutes;
            clock.toggleClockMode();
            clock.wind();
        },

        clearSnooze() {
            clearTimeout(clock.clockEvent)
            clock.end();
        },

        minuteHand: {

            positionClass: "twelve",

            wind: {
                getKeyframes: function() {
                    return "@keyframes wind-minute-hand {100%{transform: rotate(" + (clock.time * -6) + "deg);}}";
                },
            },

            unwind: {
                getKeyframes: function() {
                    return "@keyframes unwind-minute-hand {100% {transform: rotate(" + (clock.time * -6 + 360) + "deg);}}";
                },
            },

            startAnimation: function(str) {
                $(".minute-hand").addClass(str);
            },

            stopAnimation: function(str) {
                $(".minute-hand").removeClass(str);
            },

            togglePause: function() {
                if (clock.paused) {
                    $(".minute-hand").css("animation-play-state", "paused");
                } else {
                    $(".minute-hand").css("animation-play-state", "running");
                }
            },

            // Sets position class for minute hand at the beginning/end of cycles.
            // @param actionBool: true: set position based on clock time
            //                    false: reset position to 0 deg./twelve o'clock
            setPositionClass: function(actionBool) {
                var minutes = clock.time % 60;
                var positionLookup = ["twelve", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven"];
                $(".minute-hand").removeClass(clock.minuteHand.positionClass);

                if (actionBool) {
                    clock.minuteHand.positionClass = positionLookup[minutes / -5 + 12];
                } else {
                    clock.minuteHand.positionClass = "twelve";
                }

                $(".minute-hand").addClass(clock.minuteHand.positionClass);

            },
        },

        secondHand: {

            wind: {
                getKeyframes: function() {
                    return "@keyframes wind-second-hand {100%{transform: rotate(" + (clock.time * -360) + "deg);}}";

                },
            },

            startAnimation: function(str) {
                $(".second-hand").addClass(str);
            },

            stopAnimation: function(str) {
                $(".second-hand").removeClass(str);
            },

            togglePause: function() {
                if (clock.paused) {
                    $(".second-hand").css("animation-play-state", "paused");
                } else {
                    $(".second-hand").css("animation-play-state", "running");
                }
            },

        },

    };

    var cycle = {
      cycle: 0,
      
      get: function() {
        return cycle.cycle;
      },
      
      increment: function() {
        cycle.cycle += 1;
      },
      
      complete: function() {
        $('.cycle-' + cycle.cycle).addClass('complete');
      },
        
      reset: function() {
        $('.cycle').removeClass('complete');
        cycle.cycle = 0;
      },
    };
    
    var reminder = {
        reminderEvent: 0,

        set: function() {
            var counter = 1;

            reminder.reminderEvent = window.setInterval(function() {
                if (counter > 2) {
                    reminder.clear();
                }
                counter++;
                chimes.animate();
            }, 30000);
        },

        clear: function() {
            window.clearInterval(reminder.reminderEvent);
        },

    };

    var snooze = {
        state: false,
        time: 0,

        toggleSnoozeState: function() {
            snooze.state = !snooze.state;
            console.log("snooze.state " + snooze.state);
        },
        showAnimation: function() {
            $(".snooze-icon").show();
        },
        hideAnimation: function() {
            $(".snooze-icon").hide();
        },
        set: function(minutes) {
            snooze.time = minutes;
        },
        start: function(minutes) {
            snooze.toggleSnoozeState();
            snooze.set(minutes);
            clock.recieveSnooze(minutes);
            snooze.showAnimation();
        },
        clear: function() {
            clock.clearSnooze();
            snooze.hideAnimation();
        },
    };

    var messageCenter = {
        displayNextStep: function() {
            if (clock.mode === "play") {
                $(".next-step-container>span").html("START PLAYING <span class='fa fa-caret-right'></span>");
                $(".continue-working-container").show();
                $(".next-step-container").show();
            } else if (clock.mode === "work") {
                $(".next-step-container>span").html("BACK TO WORK <span class='fa fa-caret-right'></span>");
                $(".next-step-container").show();
            }
        },

        hideLevelOne: function() {
            $(".lvl1").hide();
        },

        hideLevelTwo: function() {
            $(".lvl2").hide();
        },

        hideAll: function() {
            messageCenter.hideLevelOne();
            messageCenter.hideLevelTwo();
        },

        showSnoozeOptions: function() {
            reminder.clear();
            messageCenter.hideLevelOne();
            $(".continue-control-container").show();
        },

        showStartOptions: function() {
            reminder.clear();
            messageCenter.hideLevelOne();
            $(".next-step-control-container").show();
        },

        showAdjustMessage: function() {
            messageCenter.hideAll();
            $(".next-step-adjust-message").show();
            window.setTimeout(function() {
                $(".next-step-adjust-message").hide()
            }, 3000);
        },

        startNextCycle: function() {
            messageCenter.hideAll();
            $(".control-symbol").trigger("click");
        },

    };


    $("#test").on("click", function() {
        //
    });

    $(".work-time-plus").on("click", function() {
        controlCenter.workTime.increase();
        controlCenter.workTime.update();
    });
    $(".work-time-minus").on("click", function() {
        controlCenter.workTime.decrease();
        controlCenter.workTime.update();
    });

    $(".play-time-plus").on("click", function() {
        controlCenter.playTime.increase();
        controlCenter.playTime.update();
    });
    $(".play-time-minus").on("click", function() {
        controlCenter.playTime.decrease();
        controlCenter.playTime.update();
    });

    $(".control-symbol").on("click", function() {
        controlCenter.switchboard();
    });

    $(".continue-working-container").on("click", function() {
        messageCenter.showSnoozeOptions();
    });

    $(".back").on("click", function() {
        messageCenter.hideLevelTwo();
        messageCenter.displayNextStep();
    });
    $(".snooze-5").on("click", function() {
        messageCenter.hideAll();
        snooze.start(5);
    });
    $(".snooze-10").on("click", function() {
        messageCenter.hideAll();
        snooze.start(10);

    });
    $(".snooze-15").on("click", function() {
        messageCenter.hideAll();
        snooze.start(15);
    });

    $(".next-step-container").on("click", function() {
        messageCenter.showStartOptions();
    });

    $(".next-step-adjust").on("click", function() {
        messageCenter.showAdjustMessage();
    });

    $(".next-step-start").on("click", function() {
        messageCenter.startNextCycle();
    });

});
