import { GetServerSideProps } from 'next'
import React from 'react'

function GamePage() {
  
  return (
    <div>GamePage</div>
  )
}

export default GamePage

export const getServerSideProps: GetServerSideProps = async({params}) => {
  const gameId = params?.gameId;
  
  return {
    props: {

    }
  }
}