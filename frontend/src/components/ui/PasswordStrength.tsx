import { useState, useEffect } from "react"
import { Progress } from "@/components/ui/progress"
import { Check, X } from "lucide-react"

interface PasswordStrengthProps {
  password: string
  showRequirements?: boolean
}

interface PasswordRequirement {
  label: string
  test: (password: string) => boolean
}

const requirements: PasswordRequirement[] = [
  {
    label: "At least 8 characters",
    test: (password: string) => password.length >= 8,
  },
  {
    label: "At least 1 uppercase letter",
    test: (password: string) => /[A-Z]/.test(password),
  },
  {
    label: "At least 1 number", 
    test: (password: string) => /[0-9]/.test(password),
  },
  {
    label: "At least 1 special character",
    test: (password: string) => /[^a-zA-Z0-9]/.test(password),
  },
]

export const PasswordStrength = ({ password, showRequirements = true }: PasswordStrengthProps) => {
  const [strength, setStrength] = useState(0)
  const [strengthText, setStrengthText] = useState("")
  const [strengthColor, setStrengthColor] = useState("bg-gray-300")

  useEffect(() => {
    const passedRequirements = requirements.filter(req => req.test(password)).length
    const calculatedStrength = (passedRequirements / requirements.length) * 100

    setStrength(calculatedStrength)

    if (calculatedStrength === 0) {
      setStrengthText("")
      setStrengthColor("bg-gray-300")
    } else if (calculatedStrength <= 25) {
      setStrengthText("Weak")
      setStrengthColor("bg-red-500")
    } else if (calculatedStrength <= 50) {
      setStrengthText("Fair")
      setStrengthColor("bg-orange-500")
    } else if (calculatedStrength <= 75) {
      setStrengthText("Good")
      setStrengthColor("bg-yellow-500")
    } else {
      setStrengthText("Strong")
      setStrengthColor("bg-green-500")
    }
  }, [password])

  if (!password) return null

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Password strength</span>
          <span className={`font-medium ${
            strengthText === "Strong" ? "text-green-600" :
            strengthText === "Good" ? "text-yellow-600" :
            strengthText === "Fair" ? "text-orange-600" :
            strengthText === "Weak" ? "text-red-600" :
            "text-muted-foreground"
          }`}>
            {strengthText}
          </span>
        </div>
        <Progress value={strength} className="h-2" />
      </div>

      {showRequirements && (
        <div className="space-y-1">
          {requirements.map((requirement, index) => {
            const passed = requirement.test(password)
            return (
              <div
                key={index}
                className={`flex items-center gap-2 text-sm ${
                  passed ? "text-green-600" : "text-muted-foreground"
                }`}
              >
                {passed ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <X className="h-3 w-3 text-muted-foreground" />
                )}
                {requirement.label}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}