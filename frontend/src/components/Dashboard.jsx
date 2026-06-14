import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

// Custom hook for scroll-triggered fade-in animations
function useScrollReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect(); // Only animate once
        }
      },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, visible];
}

export default function Dashboard({ authToken }) {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  // User profile
  const [profile, setProfile] = useState({
    nickname: 'Friend',
    gender: 'Prefer not to say',
    answers: {}
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!authToken) {
        const mockProfile = localStorage.getItem('mockProfile');
        if (mockProfile) {
          const data = JSON.parse(mockProfile);
          setProfile({
            nickname: data.nickname || 'Friend',
            gender: data.gender || 'Prefer not to say',
            answers: data.answers || {}
          });
        }
        return;
      }
      try {
        const res = await fetch('/api/user/profile', {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (res.ok) {
          const data = await res.json();
          setProfile({
            nickname: data.nickname || data.name || 'Friend',
            gender: data.gender || 'Prefer not to say',
            answers: data.answers || {}
          });
        }
      } catch (err) {
        console.warn("Operating in mock mode.");
      }
    };
    fetchProfile();
  }, [authToken]);

  // Navbar scroll shadow effect + active section detection
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      // Detect active section for nav highlight
      const sections = ['hero', 'insights', 'chat', 'blogs'];
      for (const id of sections) {
        const el = document.getElementById(`section-${id}`);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(id);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(`section-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // ---------- Blogs Section ----------
  const [activeBlog, setActiveBlog] = useState(null);

  const blogsData = [
    {
      id: 'imposter-syndrome',
      title: 'The Imposter in the Lecture Hall: Overcoming Academic Self-Doubt',
      author: 'Dr. Liam Peterson (University Counselor)',
      readTime: '5 mins',
      category: 'Self Doubt',
      image: '/blog_imposter.png',
      summary: 'Surrounded by highly ambitious peers, it is easy to feel like an academic fraud. Learn why this happens and how to overcome it.',
      content: [
        'Walking into a crowded university lecture hall can trigger a silent, heavy question: "Do I really belong here, or did the admissions office make a mistake?" If you have ever felt like an academic fraud waiting to be unmasked, you are experiencing Imposter Syndrome. Despite earning your place through hard work and capability, self-doubt whispers that your successes are merely the result of luck or timing.',
        'Psychologists explain that imposter syndrome is especially rampant in high-achievement environments. College brings together top students who are used to being at the head of their class. When surrounded by equally talented peers, it is easy to compare your internal insecurities ("the behind-the-scenes footage") with their polished outer achievements ("the highlight reel"). This cognitive distortion breeds the belief that everyone else is navigating the academic rigor effortlessly while you are barely keeping your head above water.',
        'Overcoming this mindset begins with externalizing your thoughts. Sharing these feelings of self-doubt with trusted friends or campus counselors usually reveals a freeing truth: almost everyone is experiencing similar feelings. Additionally, shifting your mindset from "proving your intelligence" to "growing your capabilities" turns academic challenges from threats into opportunities. Documenting your achievements, accepting constructive criticism without taking it as personal failure, and letting go of the need for perfect grades are crucial steps toward feeling confident in your academic skin.'
      ]
    },
    {
      id: 'campus-loneliness',
      title: "Beyond the Perfect Feed: Navigating 'FOMO' and Campus Loneliness",
      author: 'Priya Nair (Student Wellness Coordinator)',
      readTime: '6 mins',
      category: 'Connection',
      image: '/blog_fomo.png',
      summary: 'It is common to feel isolated even on a crowded campus. Here is how to navigate social anxiety and build authentic relationships.',
      content: [
        'College is often marketed as the most social, exciting four years of your life, filled with friendships, events, and endless laughter. However, the reality for many students is a quiet room, a glowing smartphone, and a heavy sense of isolation. Standing in the middle of a bustling campus plaza and feeling entirely alone is a paradox that millions of students experience each semester, yet rarely speak about.',
        'Social media acts as a powerful multiplier for the Fear of Missing Out (FOMO). Scrolling through Instagram or Snapchat shows peers attending parties, study groups, and weekend trips, creating the illusion of a flawless, high-energy lifestyle. What these feeds exclude is the quiet downtime, the homesickness, and the effort required to build those relationships. When you measure your daily life against these curated digital snapshots, a deep feeling of exclusion and loneliness sets in.',
        'Building meaningful connections requires swapping surface-level digital interactions for low-pressure real-life connections. Authentic friendships aren\'t built overnight; they grow through shared vulnerability and repeated, small interactions. Try joining a student club, attending a wellness workshop, or simply asking a classmate to grab coffee. Reclaim your focus by limiting screen time and acknowledging that everyone is searching for connection. You don\'t need a massive social circle—just a few genuine, supportive connections.'
      ]
    },
    {
      id: 'perfectionism-trap',
      title: "The Perfectionism Trap: Why Your GPA Doesn't Define You",
      author: 'Dr. Elizabeth Thorne (Clinical Psychologist)',
      readTime: '5 mins',
      category: 'Self-Worth',
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800',
      summary: 'When academic success becomes your sole identity, setbacks feel catastrophic. Discover how to practice healthy self-worth.',
      content: [
        'For many college students, self-worth is directly tied to their grade point average. A bad test score or a critical essay review doesn\'t just feel like a minor setback; it feels like a total failure of character. This is the perfectionism trap—a toxic mindset that tells you that you must be flawless in every academic pursuit to be considered valuable or worthy of respect.',
        'There is a critical difference between healthy striving and toxic perfectionism. Healthy striving is internally motivated; it focuses on personal growth, curiosity, and the satisfaction of learning. Perfectionism, on the other hand, is externally driven by a fear of failure, judgment, and the need to protect a fragile sense of self-worth. When your entire identity is built on a series of A\'s, you live in constant state of threat-response, which floods your system with cortisol and paralyzes your potential.',
        'To break free, you must practice separating your performance from your identity. Work on adopting the "good enough" rule: doing your best within a reasonable time limit and then moving on. Cultivate hobbies and interests that have no grades or evaluation metrics associated with them—like painting, playing a casual sport, or cooking. Most importantly, practice self-compassion: when you make a mistake, treat yourself with the same kindness and understanding you would offer a friend.'
      ]
    },
    {
      id: 'midterm-meltdown',
      title: 'Mastering the Midterm Meltdown: Science-Backed Study Rhythms',
      author: 'Prof. Derek Cho (Learning Sciences Researcher)',
      readTime: '4 mins',
      category: 'Study Habits',
      image: 'https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&q=80&w=800',
      summary: 'All-nighters and constant cramming spike stress and reduce recall. Learn how to optimize study sessions with mental calm.',
      content: [
        'As midterms approach, campus libraries fill up, coffee sales skyrocket, and sleep schedules collapse. The traditional response to academic stress is to pull all-nighters, cramming information into your brain in high-intensity marathons. While this might feel productive, neuroscience reveals that sleep deprivation and stress hormones like cortisol actively block memory consolidation and critical thinking.',
        'A smarter, healthier approach is to work in harmony with your brain\'s natural cognitive cycles. The brain can only maintain high levels of focus for about 45 to 60 minutes before its attention span declines. Incorporating structured study sessions, such as the Pomodoro Technique (25 minutes of work followed by 5 minutes of rest), prevents burnout and keeps your mental pathways clear. During rest intervals, walk away from screens to let your default mode network process the information.',
        'Additionally, swap passive reviewing (like rereading highlighted textbooks) for active retrieval practices, such as flashcards, self-quizzing, and explaining concepts to a friend. These active recall methods build stronger neural pathways. Finally, manage test anxiety by integrating simple breathing exercises, like box breathing, before an exam. Spaced study habits, combined with restful sleep and stress management, lead to far better results than any coffee-fueled all-nighter ever could.'
      ]
    }
  ];

  // ---------- Chat ----------
  const [chatMessages, setChatMessages] = useState([]);
  const [inputVal, setInputVal] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    setChatMessages([{
      role: 'bot',
      text: `Hi ${profile.nickname} 👋 I'm Nova, your AI wellness companion. How are you feeling today?`
    }]);
  }, [profile.nickname]);

  useEffect(() => {
    if (chatMessages.length > 1 && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [chatMessages]);

  const handleSend = () => {
    if (!inputVal.trim()) return;
    const newMsgs = [...chatMessages, { role: 'user', text: inputVal }];
    setChatMessages(newMsgs);
    const lowers = inputVal.toLowerCase();
    setInputVal('');
    setTimeout(() => {
      let botResponse = "I'm always here to listen and help you unpack your day. Tell me more 💬";
      if (lowers.includes('stress') || lowers.includes('anxious')) {
        botResponse = "I hear you. Stress is heavy. Take a breath with me — what's one small thing we can do right now to ease the weight? 🫂";
      } else if (lowers.includes('tired') || lowers.includes('exhausted')) {
        botResponse = "Let's keep things low-pressure. You don't need to fix anything right now. Just rest, you deserve it. ☕";
      } else if (lowers.includes('sad') || lowers.includes('cry')) {
        botResponse = "It's completely okay to feel sad. You don't need to put on a brave face with me. I'm right here ❤️";
      }
      setChatMessages(prev => [...prev, { role: 'bot', text: botResponse }]);
    }, 1200);
  };

  // Scroll reveal refs
  const [aboutRef, aboutVisible] = useScrollReveal();
  const [featuresRef, featuresVisible] = useScrollReveal();
  const [insightsRef, insightsVisible] = useScrollReveal();
  const [chatRef, chatVisible] = useScrollReveal();
  const [blogsRef, blogsVisible] = useScrollReveal();



  return (
    <div className="hub-wrapper">

      {/* ──────── Sticky Nav Bar ──────── */}
      <nav className={`hub-navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="hub-logo">
          <img src="/mascot.png" alt="Nova mascot" className="hub-logo-icon-img" />
          <span className="hub-logo-text">Novara</span>
        </div>

        <div className="hub-nav-links">
          {[
            { id: 'hero', label: 'Home' },
            { id: 'insights', label: 'My Insights' },
            { id: 'chat', label: 'Nova AI' },
            { id: 'blogs', label: 'Blogs to Read' }
          ].map(({ id, label }) => (
            <button
              key={id}
              className={`nav-link-btn ${activeSection === id ? 'active' : ''}`}
              onClick={() => scrollTo(id)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="hub-nav-actions">
          <button
            className="hub-auth-btn"
            onClick={() => authToken ? navigate('/') : navigate('/login')}
          >
            {authToken ? '🚪 Log Out' : '✨ Sign In to Save'}
          </button>
        </div>
      </nav>

      {/* ──────── HERO SECTION ──────── */}
      <section id="section-hero" className="hub-section section-hero">
        <div className="hero-bg-blobs">
          <div className="blob blob-1" />
          <div className="blob blob-2" />
          <div className="blob blob-3" />
        </div>
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="hero-brand">Novara</span>
          </h1>
          <h2 className="hero-subtitle">Your AI Companion for Mental & Emotional Health</h2>

          <div className="hero-mascot-container">
            <img src="/mascot.png" alt="Nova mascot waving hello" className="hero-mascot-img" />
          </div>

          <button className="hero-cta-btn" onClick={() => scrollTo('chat')}>
            💬 Talk to me
          </button>

          <p className="hero-tagline">
            Nova is here for you <strong>24/7</strong> — like a friend who listens, a coach who guides, and a bridge to support when you need one. Private and judgment-free!
          </p>

          <div className="hero-stats">
            <div className="hero-stat">
              <span className="stat-num">24/7</span>
              <span className="stat-label">Always here</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="stat-num">100%</span>
              <span className="stat-label">Judgment-free</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="stat-num">🔒</span>
              <span className="stat-label">Private & safe</span>
            </div>
          </div>

          <div className="scroll-indicator" onClick={() => scrollTo('insights')}>
            <span>Scroll to explore</span>
            <div className="scroll-arrow">↓</div>
          </div>
        </div>
      </section>

      {/* ──────── ABOUT VIDEO SECTION ──────── */}
      <section id="section-about" className="hub-section section-about">
        <div ref={aboutRef} className={`reveal-wrapper ${aboutVisible ? 'revealed' : ''}`}>
          <h2 className="about-title">Meet Nova</h2>
          <p className="about-desc">
            I've been through tough times—feeling alone, overwhelmed and stuck in patterns that didn't help.<br />
            With the right support, I learned to understand myself and heal. Now, I'm here for you. To listen, to<br />
            guide and to be by your side—anytime, anywhere.
          </p>
          <h3 className="about-subtitle">Your AI-Powered Mental Health Companion.</h3>
          
          <div className="about-video-container">
            {/* Video Placeholder */}
            <div className="video-placeholder">
              <span className="play-icon">▶</span>
              <p>Video coming soon</p>
            </div>
          </div>
        </div>
      </section>

      {/* ──────── PLATFORM FEATURES ──────── */}
      <section id="section-features" className="hub-section section-features">
        <div ref={featuresRef} className={`reveal-wrapper ${featuresVisible ? 'revealed' : ''}`}>
          <h2 className="section-title">What does our mental health wellness platform provide you :</h2>
          
          <div className="features-grid">
            <div className="feature-card" onClick={() => navigate('/chat?tab=chat')}>
              <span className="feature-icon">🤖</span>
              <h3>Chat with AI</h3>
              <p>Deep empathy and smart insights, available 24/7.</p>
            </div>
            <div className="feature-card" onClick={() => navigate('/chat?tab=self-tests')}>
              <span className="feature-icon">📝</span>
              <h3>Self Tests</h3>
              <p>Discover insights about your habits and mental health.</p>
            </div>
            <div className="feature-card" onClick={() => navigate('/chat?tab=counselor')}>
              <span className="feature-icon">🧑‍⚕️</span>
              <h3>Talk to counsellor</h3>
              <p>Match with experts aligned to your personality.</p>
            </div>
            <div className="feature-card" onClick={() => navigate('/chat?tab=self-care')}>
              <span className="feature-icon">🌿</span>
              <h3>Wellness corner</h3>
              <p>Tools to improve concentration and help you feel in control.</p>
            </div>
            <div className="feature-card" onClick={() => scrollTo('blogs')}>
              <span className="feature-icon">📚</span>
              <h3>Read our blogs</h3>
              <p>Thought-provoking articles, advice, and stories curated for college students.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ──────── INSIGHTS SECTION ──────── */}
      <section id="section-insights" className="hub-section section-insights">
        <div ref={insightsRef} className={`reveal-wrapper ${insightsVisible ? 'revealed' : ''}`}>
          <div className="section-label">Personalized for You</div>
          <h2 className="section-title">Your Wellness Insights</h2>
          <p className="section-sub">Curated based on your onboarding answers</p>

          <div className="insights-grid">
            {profile.answers[1] && profile.answers[1].choice === 'Yes' && (
              <div className="insight-card">
                <span className="insight-tag tag-amber">Energy</span>
                <h3>Boost Your Vitality</h3>
                <p>Since you've been feeling low on energy, try micro-movements — a 5-minute walk every hour can dramatically lift your mood and energy levels.</p>
              </div>
            )}
            {profile.answers[5] && profile.answers[5].choice === 'Yes' && (
              <div className="insight-card">
                <span className="insight-tag tag-red">Compassion</span>
                <h3>Quiet Your Inner Critic</h3>
                <p>Practice the <em>Self-Compassion Pause</em>: treat yourself with the exact same kindness you would show a dear friend in this moment.</p>
              </div>
            )}
            {profile.answers[6] && profile.answers[6].choice === 'Yes' && (
              <div className="insight-card">
                <span className="insight-tag tag-blue">Mindfulness</span>
                <h3>Break Rumination Loops</h3>
                <p>For looping overthinking, try <em>Cognitive Shifting</em>: write the thoughts down, close the journal, then do a brief physical task to reset.</p>
              </div>
            )}
            <div className="insight-card">
              <span className="insight-tag tag-green">Rest</span>
              <h3>Improve Your Sleep Rhythm</h3>
              <p>Protect your biological clock by turning off screens 45 minutes before bed. Swap scrolling for simple stretching or light reading.</p>
            </div>
            <div className="insight-card">
              <span className="insight-tag tag-purple">Focus</span>
              <h3>Bite-Sized Goal Setting</h3>
              <p>Keep goals incredibly low-pressure. Break each item into tiny 10-minute sprints — this prevents overwhelm and builds momentum.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ──────── CHAT SECTION ──────── */}
      <section id="section-chat" className="hub-section section-chat">
        <div ref={chatRef} className={`reveal-wrapper ${chatVisible ? 'revealed' : ''}`}>
          <div className="section-label">AI Companion</div>
          <h2 className="section-title">Chat with Nova</h2>
          <p className="section-sub">Your empathetic, judgment-free space — available around the clock</p>

          <div className="hub-chat-container">
            <div className="mini-chat-widget-wrapper">
              <div className="mini-chat-header">
                <div className="mini-chat-status-dot" />
                <div>
                  <div className="mini-chat-header-name">Nova</div>
                  <div className="mini-chat-header-status">Online & listening...</div>
                </div>
              </div>
              <div className="mini-chat-body">
                {chatMessages.map((m, i) => (
                  <div key={i} className={`mini-chat-bubble ${m.role}`}>
                    {m.text}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <div className="mini-chat-input-row">
                <input
                  type="text"
                  className="mini-chat-input"
                  placeholder="Share what's on your mind..."
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <button className="mini-chat-send-btn" onClick={handleSend}>
                  ➤
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────── BLOGS TO READ SECTION ──────── */}
      <section id="section-blogs" className="hub-section section-blogs">
        <div ref={blogsRef} className={`reveal-wrapper ${blogsVisible ? 'revealed' : ''}`}>
          <div className="section-label">Read and Reflect</div>
          <h2 className="section-title">Blogs to Read</h2>
          <p className="section-sub">Thought-provoking resources to support your mental health and college journey</p>

          <div className="blogs-grid">
            {blogsData.map((blog) => (
              <div key={blog.id} className="blog-card" onClick={() => setActiveBlog(blog)}>
                <div className="blog-card-image-wrapper">
                  <img src={blog.image} alt={blog.title} className="blog-card-img" />
                  <div className="blog-card-image-overlay" />
                </div>
                <div className="blog-card-content">
                  <span className="blog-category-tag">{blog.category}</span>
                  <h3 className="blog-card-title">{blog.title}</h3>
                  <p className="blog-card-summary">{blog.summary}</p>
                  <div className="blog-card-footer">
                    <span className="blog-author">{blog.author}</span>
                    <span className="blog-readtime">⏱️ {blog.readTime}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────── BLOG READER MODAL ──────── */}
      {activeBlog && (
        <div className="blog-modal-overlay" onClick={() => setActiveBlog(null)}>
          <div className="blog-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="blog-modal-close-btn" onClick={() => setActiveBlog(null)}>×</button>
            <div 
              className="blog-modal-header-hero" 
              style={{ backgroundImage: `url(${activeBlog.image})` }}
            >
              <div className="blog-modal-hero-overlay" />
              <div className="blog-modal-hero-text">
                <span className="blog-modal-category">{activeBlog.category}</span>
                <h1 className="blog-modal-title">{activeBlog.title}</h1>
                <div className="blog-modal-meta">
                  <span>Written by {activeBlog.author}</span>
                  <span className="meta-dot">•</span>
                  <span>{activeBlog.readTime} read</span>
                </div>
              </div>
            </div>
            <div className="blog-modal-body">
              {activeBlog.content.map((paragraph, index) => (
                <p key={index} className="blog-modal-paragraph">{paragraph}</p>
              ))}
            </div>
            <div className="blog-modal-footer">
              <button className="blog-modal-back-btn" onClick={() => setActiveBlog(null)}>
                Close Article
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ──────── FOOTER ──────── */}
      <footer className="hub-footer">
        <div className="hub-footer-logo">🌿 Novara</div>
        <p className="hub-footer-tagline">Made with ❤️ for your mental wellness journey</p>
      </footer>

    </div>
  );
}
