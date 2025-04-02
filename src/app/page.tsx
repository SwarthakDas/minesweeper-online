"use client"
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import {motion} from "framer-motion"
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const Page = () => {
  const [username,setUsername]=useState("")
  const router=useRouter()

  const handleSubmit=(e:React.FormEvent)=>{
    e.preventDefault()
    if(username.trim()){
      localStorage.setItem("minesweeper-username",username.trim())
      router.push("/game")
    }
  }

  return (
    <div className='flex flex-col min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted p-4'>
      <motion.div
      initial={{opacity:0,y:-20}}
      animate={{opacity:1,y:0}}
      transition={{duration:0.5}}
      className='w-full max-w-md space-y-8'
      >
        <div className='text-center'>
          <h1 className='text-4xl font-bold tracking-tight'>Minesweeper</h1>
          <p className='mt-2 text-muted-foreground'>Enter your username to start playing</p>
        </div>
        <form onSubmit={handleSubmit} className='mt-8 space-y-6'>
          <motion.div
          initial={{opacity:0}}
          animate={{opacity:1}}
          transition={{duration:0.5,delay:0.2}}
          className='space-y-2'
          >
            <Input
            type="text"
            placeholder='Username'
            value={username}
            onChange={(e)=>setUsername(e.target.value)}
            className='h-12 text-lg'
            required
            autoFocus
            />
          </motion.div>
          <motion.div
          initial={{opacity:0}}
          animate={{opacity:1}}
          transition={{duration:0.5,delay:0.4}}
          >
            <Button className='w-full h-12 text-lg' type='submit' disabled={!username.trim()}>Play Game</Button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  )
}

export default Page
