// Confetti.js - A simple confetti animation
// Source & License: https://www.kirilv.com/canvas-confetti/

(function() {
  var Confetti, conf, confetti, headache, makeItRain, particleCount;

  Confetti = (function() {
    function Confetti() {
      this.style = getComputedStyle(document.body);
      this.canvas = document.createElement("canvas");
      this.canvas.width = document.documentElement.clientWidth;
      this.canvas.height = document.documentElement.clientHeight;
      this.ctx = this.canvas.getContext("2d");
      this.width = this.canvas.width;
      this.height = this.canvas.height;
      this.particles = [];
      this.colors = ["#8a2be2", "#ff69b4", "#ffd700", "#87cefa", "#7fff00"];
      this.canvas.style.position = "fixed";
      this.canvas.style.top = "0";
      this.canvas.style.left = "0";
      this.canvas.style.pointerEvents = "none";
      this.canvas.style.zIndex = "1000";
      document.body.appendChild(this.canvas);
      window.addEventListener("resize", (function(_this) {
        return function() {
          _this.canvas.width = document.documentElement.clientWidth;
          _this.canvas.height = document.documentElement.clientHeight;
          _this.width = _this.canvas.width;
          return _this.height = _this.canvas.height;
        };
      })(this));
    }

    Confetti.prototype.addParticle = function() {
      return this.particles.push({
        color: this.colors[Math.floor(Math.random() * this.colors.length)],
        x: Math.random() * this.width,
        y: 0,
        vx: Math.random() * 3 - 1.5,
        vy: Math.random() * 2 + 1,
        width: Math.random() * 10 + 5,
        height: Math.random() * 4 + 2,
        rotation: Math.random() * 360
      });
    };

    Confetti.prototype.update = function() {
      var i, len, particle, ref, results;
      ref = this.particles;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        particle = ref[i];
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.rotation += 2;
        if (particle.y > this.height) {
          results.push(this.particles.splice(i, 1));
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    Confetti.prototype.draw = function() {
      var i, len, particle, ref, results;
      this.ctx.clearRect(0, 0, this.width, this.height);
      ref = this.particles;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        particle = ref[i];
        this.ctx.save();
        this.ctx.fillStyle = particle.color;
        this.ctx.translate(particle.x, particle.y);
        this.ctx.rotate(particle.rotation * Math.PI / 180);
        this.ctx.fillRect(-particle.width / 2, -particle.height / 2, particle.width, particle.height);
        results.push(this.ctx.restore());
      }
      return results;
    };

    return Confetti;

  })();

  conf = new Confetti();

  particleCount = 0;

  makeItRain = function() {
    if (particleCount < 100) {
      conf.addParticle();
      particleCount++;
    }
    conf.update();
    conf.draw();
    return requestAnimationFrame(makeItRain);
  };

  confetti = {
    start: function() {
      particleCount = 0;
      return makeItRain();
    },
    stop: function() {
      return particleCount = 100;
    }
  };

  if (document.body.classList.contains('birthday-page')) {
    setTimeout(function() {
      return confetti.start();
    }, 1000);
  }

  window.confetti = confetti;

}).call(this);