const TECHS = [
  { name: "HTML5", icon: "fab fa-html5", color: "#e34f26" },
  { name: "CSS3", icon: "fab fa-css3-alt", color: "#1572b6" },
  { name: "JavaScript", icon: "fab fa-js", color: "#f7df1e" },
  { name: "React", icon: "fab fa-react", color: "#61dafb" },
  { name: "Vue.js", icon: "fab fa-vuejs", color: "#42b883" },
  { name: "Angular", icon: "fab fa-angular", color: "#dd0031" },
  { name: "Node.js", icon: "fab fa-node-js", color: "#3c873a" },
  { name: "PHP", icon: "fab fa-php", color: "#777bb4" },
  { name: "Laravel", icon: "fab fa-laravel", color: "#ff2d20" },
  { name: "WordPress", icon: "fab fa-wordpress", color: "#21759b" },
  { name: "AWS", icon: "fab fa-aws", color: "#ff9900" },
  { name: "Git", icon: "fab fa-git-alt", color: "#f05032" },
  { name: "Sass", icon: "fab fa-sass", color: "#cc6699" },
];

const TechMarquee = () => {
  // Rendered twice so the -50% keyframe loops seamlessly.
  const loop = [...TECHS, ...TECHS];
  return (
    <div className="marquee-wrap" aria-hidden="true">
      <div className="marquee">
        {loop.map((t, i) => (
          <span className="tech-item" key={i}>
            <i className={t.icon} style={{ color: t.color }} />
            {t.name}
          </span>
        ))}
      </div>
    </div>
  );
};

export default TechMarquee;
