'use client'

import React from 'react'
import SectionHeading from './section-heading'
import { projectsData } from '../../lib/data'
import Project from './project'
import { useSectionInView } from '../../lib/hooks'

export default function Projects() {
    const { ref } = useSectionInView('Projects', .25)

  return (
    <section id='projects'
        ref={ref} className='scroll-mt-28 mb-28'>
        <SectionHeading>My Projects</SectionHeading>
        <div>
            {
            projectsData.map(project => (
                <React.Fragment key={project.title}>
                    <Project {...project}/>
                </React.Fragment>
            ))
            } 
        </div>
    </section>
  )
}
