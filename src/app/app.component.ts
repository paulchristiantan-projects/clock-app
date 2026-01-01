import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnDestroy {
  // Tab management
  activeTab = 'clock';
  
  // Clock properties
  currentTime = '';
  currentDate = '';
  greeting = '';
  dailyQuote = 'Loading Bible verse...';
  isDayTime = true;
  hourAngle = 0;
  minuteAngle = 0;
  secondAngle = 0;
  private clockInterval: any;
  
  // Timer properties
  timerSeconds = 0;
  timerMinutes = 0;
  timerSecondsInput = 0;
  timerRunning = false;
  private timerInterval: any;
  
  // Stopwatch properties
  stopwatchTime = 0;
  stopwatchRunning = false;
  laps: number[] = [];
  private stopwatchInterval: any;
  
  // Pomodoro properties
  workMinutes = 25;
  breakMinutes = 5;
  timeLeft = this.workMinutes * 60;
  isRunning = false;
  currentSession = 'Work';
  private pomodoroInterval: any;

  constructor() {
    this.updateClock();
    this.clockInterval = setInterval(() => this.updateClock(), 1000);
    this.fetchDailyQuote();
  }

  // Pomodoro methods
  toggleTimer() {
    this.isRunning = !this.isRunning;
    
    if (this.isRunning) {
      this.pomodoroInterval = setInterval(() => {
        this.timeLeft--;
        
        if (this.timeLeft === 0) {
          this.switchSession();
        }
      }, 1000);
    } else {
      clearInterval(this.pomodoroInterval);
    }
  }

  resetPomodoroTimer() {
    this.isRunning = false;
    clearInterval(this.pomodoroInterval);
    this.currentSession = 'Work';
    this.timeLeft = this.workMinutes * 60;
  }

  switchSession() {
    if (this.currentSession === 'Work') {
      this.currentSession = 'Break';
      this.timeLeft = this.breakMinutes * 60;
    } else {
      this.currentSession = 'Work';
      this.timeLeft = this.workMinutes * 60;
    }
  }

  setPreset(work: number, breakTime: number) {
    if (!this.isRunning) {
      this.workMinutes = work;
      this.breakMinutes = breakTime;
      this.updateTimer();
    }
  }

  updateTimer() {
    if (!this.isRunning) {
      if (this.currentSession === 'Work') {
        this.timeLeft = this.workMinutes * 60;
      } else {
        this.timeLeft = this.breakMinutes * 60;
      }
    }
  }

  onWorkChange(event: any) {
    const value = parseInt(event.target.value);
    if (value >= 1 && value <= 120) {
      this.workMinutes = value;
      this.updateTimer();
    }
  }

  onBreakChange(event: any) {
    const value = parseInt(event.target.value);
    if (value >= 1 && value <= 60) {
      this.breakMinutes = value;
      this.updateTimer();
    }
  }

  // Tab management
  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  // Clock methods
  updateClock() {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString();
    this.currentDate = now.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    // Update analog clock angles
    const hours = now.getHours() % 12;
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    
    this.hourAngle = (hours * 30) + (minutes * 0.5);
    this.minuteAngle = minutes * 6;
    this.secondAngle = seconds * 6;
    
    // Update greeting based on time
    const currentHour = now.getHours();
    if (currentHour >= 5 && currentHour < 12) {
      this.greeting = 'Good Morning, Paul';
      this.isDayTime = true;
    } else if (currentHour >= 12 && currentHour < 18) {
      this.greeting = 'Good Day, Paul';
      this.isDayTime = true;
    } else {
      this.greeting = 'Good Night, Paul';
      this.isDayTime = false;
    }
  }

  // Timer methods
  startTimer() {
    this.timerSeconds = (this.timerMinutes * 60) + this.timerSecondsInput;
    if (this.timerSeconds > 0) {
      this.timerRunning = true;
      this.timerInterval = setInterval(() => {
        this.timerSeconds--;
        if (this.timerSeconds <= 0) {
          this.pauseTimer();
        }
      }, 1000);
    }
  }

  pauseTimer() {
    this.timerRunning = false;
    clearInterval(this.timerInterval);
  }

  resetTimer() {
    this.pauseTimer();
    this.timerSeconds = 0;
  }

  // Stopwatch methods
  startStopwatch() {
    this.stopwatchRunning = true;
    this.stopwatchInterval = setInterval(() => {
      this.stopwatchTime += 10;
    }, 10);
  }

  pauseStopwatch() {
    this.stopwatchRunning = false;
    clearInterval(this.stopwatchInterval);
  }

  resetStopwatch() {
    this.pauseStopwatch();
    this.stopwatchTime = 0;
    this.laps = [];
  }

  lapStopwatch() {
    this.laps.push(this.stopwatchTime);
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  formatStopwatchTime(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const ms = Math.floor((milliseconds % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  }

  onTimerMinutesChange(event: any) {
    const value = parseInt(event.target.value) || 0;
    if (value >= 0 && value <= 59) {
      this.timerMinutes = value;
    }
  }

  onTimerSecondsChange(event: any) {
    const value = parseInt(event.target.value) || 0;
    if (value >= 0 && value <= 59) {
      this.timerSecondsInput = value;
    }
  }

  fetchDailyQuote() {
    fetch(`https://labs.bible.org/api/?passage=votd&type=json`)
      .then(response => response.json())
      .then(data => {
        this.dailyQuote = `"${data[0].text}" - ${data[0].bookname} ${data[0].chapter}:${data[0].verse}`;
      })
      .catch(() => {
        // If primary API fails, try alternative
        fetch('https://bible-api.com/random')
          .then(response => response.json())
          .then(data => {
            this.dailyQuote = `"${data.text.trim()}" - ${data.reference}`;
          })
          .catch(() => {
            // Final fallback - today's date determines verse
            const today = new Date();
            const seed = today.getDate() + today.getMonth() * 31 + today.getFullYear();
            fetch(`https://bible-api.com/random?seed=${seed}`)
              .then(response => response.json())
              .then(data => {
                this.dailyQuote = `"${data.text.trim()}" - ${data.reference}`;
              })
              .catch(() => {
                this.dailyQuote = '"For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, to give you hope and a future." - Jeremiah 29:11';
              });
          });
      });
  }

  ngOnDestroy() {
    if (this.pomodoroInterval) {
      clearInterval(this.pomodoroInterval);
    }
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
    }
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    if (this.stopwatchInterval) {
      clearInterval(this.stopwatchInterval);
    }
  }
}