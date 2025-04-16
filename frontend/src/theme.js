import { defineStyle, defineStyleConfig } from '@chakra-ui/react'

const baseStyle = defineStyle({
  fontFamily: "Vazirmatn, sans-serif",
})

const theme = defineStyleConfig({ baseStyle })

export default theme