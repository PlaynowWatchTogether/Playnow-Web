import Controller from '@ember/controller';
import {computed} from '@ember/object';

export default Controller.extend({
  jobs: computed(function(){
    return [
      {
        title: 'iOS Engineer',
        description: 'We are looking for an iOS developer responsible for the development, innovation and maintenance of Playnows. Your primary focus will be development of iOS applications and their integration with back-end services. You will be working alongside other engineers and developers working on different layers of the infrastructure. Therefore, a commitment to collaborative problem solving, sophisticated design, and the creation of quality products is essential.',
        resp: [
          'Design and build applications for the iOS platform',
          'Ensure the performance, quality, and responsiveness of applications',
          'Collaborate with a team to define, design, and ship new features',
          'Identify and correct bottlenecks and fix bugs',
          'Help maintain code quality, organization, and automatisation'
        ],
        skills:[
          'Proficient with Objective-C and/or Swift',
          'Experience with iOS frameworks such as Core Data, Core Animation, etc.',
          'Experience with offline storage, threading, and performance tuning',
          'Familiarity with RESTful APIs to connect iOS applications to back-end services',
          'Knowledge of other web technologies and UI/UX standards',
          'Understanding of Apple’s design principles and interface guidelines',
          'Knowledge of low-level C-based libraries is preferred',
          'Experience with performance and memory tuning with tools',
          'Familiarity with cloud message APIs and push notifications',
          'Knack for benchmarking and optimization',
          'Proficient understanding of code versioning tools such as Git',
          'Familiarity with continuous integration'
        ],
        applyLink: "mailto:andrew.jang@playnowmessenger.com?subject=I'm a genius developer (iOS Developer)"
      },
      {
        title: 'UI/UX Designer',
        description: "As our mobile designer, you will work closely with the mobile product team. Your primary goal will be to design the next iterations of the Playnows app across multiple platforms such as iOS, Android, Windows, and mobile web. We expect you to have an evolved understanding of how people use their devices, the flexibility to adapt to new technologies, and a robust toolkit.",
        resp:[
          "Develop intuitive, usable, and engaging interactions and visual designs for mobile.",
          "Provide strategic thinking and leadership.",
          "Collaborate with cross-functional teams throughout the design process",
          "Participate in the development process from definition, through design, build, test, release, and maintenance.",
          "Stay abreast of UX trends and look for creative ideas and inspiration in parallel analogous worlds.",
          "Research and track advancements in mobile application design patterns.",
          "Staying in the loop and on top of the latest standards, changes, trends in the mobile design field."
        ],
        skills:[
          "Strong graphic design skills, with a good understanding of typography, intuitive layouts and palate development.",
          "Strong ability to recognize use-cases and user interaction, including happy path, edge and corner cases, and incorporate them into designs.",
          "Excellent understanding of user-experience design for mobile and the web, technology trends, demonstrable design skills, and ability to show relevant work.",
          "Proven ability to deliver high quality designs to customers.",
          "A team player who can easily adapt in a rapidly changing environment."
        ],
        applyLink:"mailto:andrew.jang@playnowmessenger.com?subject=I'm Picasso of UI Designers(UI/UX Designer)"
      }
    ];
  })
});
