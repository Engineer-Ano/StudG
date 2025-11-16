import React from 'react'
import Header from './Header'
import QuestCard from './QuestCard'

export default function StudyRoyaleApp() {
  return (
    <div className="p-6">
      <Header />
      <QuestCard title="Math 1" reward="Clash Royale Points" />
      <QuestCard title="Programming Essentials" reward="TikTok break" />
      <QuestCard title="Linear Algebra" reward="Snack break" />
      <QuestCard title="Discrete Math" reward="Coffee break" />
      <QuestCard title="Calculus 1" reward="Walk outside" />
    </div>
  )
}
