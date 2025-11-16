import React from 'react'
export default function QuestCard({ title, reward }) {
  return (
    <div className="bg-white shadow p-4 rounded mb-4">
      <h2 className="text-xl font-bold">{title}</h2>
      <p>Reward: {reward}</p>
    </div>
  )
}
