"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload, FileText, Sparkles, BookOpen, ArrowRight, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { uploadManuscript, supabase } from "@/lib/supabase"

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [uploadMessage, setUploadMessage] = useState('')

  const handleFileSelect = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".pdf"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        handleFileUpload(file)
      }
    }
    input.click()
  }

  const handleFileUpload = async (file: File) => {
    setIsLoading(true)
    setUploadStatus('idle')
    setUploadMessage('')

    try {
      if (file.type !== 'application/pdf') throw new Error('Seuls les fichiers PDF sont acceptés')
      const maxSize = 50 * 1024 * 1024
      if (file.size > maxSize) throw new Error('Le fichier est trop volumineux (max 50MB)')

      // Upload to n8n form instead of Supabase directly
      const formData = new FormData()
      formData.append('manuscript', file)
      
      const response = await fetch('https://n8n.srv850293.hstgr.cloud/form/274283dc-9413-4264-bba4-c66f1eb3512e', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`Erreur lors de l'upload: ${response.status}`)
      }

      const result = await response.json()
      console.log('File uploaded to n8n successfully:', result)

      setUploadStatus('success')
      setUploadMessage('Fichier téléchargé avec succès ! Le traitement va commencer automatiquement.')
      setIsLoading(false)
    } catch (error) {
      setUploadStatus('error')
      setUploadMessage(error instanceof Error ? error.message : 'Une erreur est survenue')
      console.error('Processing error:', error)
      setIsLoading(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files && files[0] && files[0].type === "application/pdf") {
      handleFileUpload(files[0])
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Header */}
      <header className="glass fixed top-0 w-full z-50 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <a 
            href="#" 
            onClick={(e) => {
              e.preventDefault()
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            <span className="text-lg sm:text-xl font-bold text-foreground">DaWan Cover</span>
          </a>
          <nav className="hidden md:flex gap-6">
            <a href="#features" className="text-muted-foreground hover:text-primary transition-colors">
              Fonctionnalités
            </a>
            <a href="#process" className="text-muted-foreground hover:text-primary transition-colors">
              Comment ça marche
            </a>
            <a href="#contact" className="text-muted-foreground hover:text-primary transition-colors">
              Contact
            </a>
          </nav>
          <Button variant="ghost" size="sm" className="md:hidden">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 sm:pt-24 pb-16">
        {/* Hero Section */}
        <section className="px-4 sm:px-6 py-12 sm:py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-balance mb-4 sm:mb-6">
              <span className="text-foreground">Conception de couverture</span>{" "}
              <span className="text-primary">assistée par IA</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground text-balance mb-8 sm:mb-12 max-w-3xl mx-auto">
              Transformez votre manuscrit en une couverture professionnelle en quelques clics
            </p>

            {/* Main CTA Button */}
            <Button
              onClick={handleFileSelect}
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-base sm:text-lg px-8 sm:px-12 py-6 sm:py-8 h-auto rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 mb-8 sm:mb-16 w-full sm:w-auto"
            >
              {isLoading ? (
                <>
                  <div className="mr-3 flex items-center">
                    <div className="relative">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-primary-foreground/20 rounded-full"></div>
                      <div className="absolute top-0 left-0 w-5 h-5 sm:w-6 sm:h-6 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </div>
                  <span className="hidden sm:inline">La magie opère...</span>
                  <span className="sm:hidden">Traitement...</span>
                </>
              ) : (
                <>
                  <Sparkles className="mr-3 h-5 w-5 sm:h-6 sm:w-6" />
                  <span className="hidden sm:inline">Téléchargez votre manuscrit et laissez la magie opérer</span>
                  <span className="sm:hidden">Télécharger manuscrit</span>
                </>
              )}
            </Button>

            <p className="text-sm sm:text-base text-muted-foreground mb-6">
              Format PDF uniquement • Maximum 50MB
            </p>

            {/* Loading Progress Indicator */}
            {isLoading && (
              <div className="mb-8 max-w-md mx-auto">
                <div className="bg-gradient-to-r from-primary/10 via-primary/20 to-primary/10 rounded-full p-6 border border-primary/20">
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                  </div>
                  <p className="text-center text-sm text-primary font-medium">
                    Traitement du manuscrit en cours...
                  </p>
                  <div className="mt-3 w-full bg-primary/10 rounded-full h-1">
                    <div className="bg-gradient-to-r from-primary to-primary/80 h-1 rounded-full animate-pulse" style={{width: '60%'}}></div>
                  </div>
                </div>
              </div>
            )}

            {/* Upload Status Message */}
            {uploadMessage && !isLoading && (
              <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 max-w-md mx-auto ${
                uploadStatus === 'success' 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {uploadStatus === 'success' ? (
                  <CheckCircle className="h-5 w-5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                )}
                <p className="text-sm sm:text-base">{uploadMessage}</p>
              </div>
            )}
          </div>
        </section>

        {/* Process Section */}
        <section id="process" className="px-4 sm:px-6 py-12 sm:py-20">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-foreground mb-8 sm:mb-16">
              Comment ça marche
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {/* Step 1 */}
              <div className="text-center">
                <Card className="glass-card p-6 sm:p-8 mb-4 sm:mb-6 hover:scale-105 transition-transform duration-300">
                  <FileText className="h-12 w-12 sm:h-16 sm:w-16 text-primary mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">1. Téléchargez</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">Importez votre manuscrit PDF</p>
                </Card>
                <ArrowRight className="h-6 w-6 text-primary mx-auto hidden md:block rotate-90 md:rotate-0" />
              </div>

              {/* Step 2 */}
              <div className="text-center">
                <Card className="glass-card p-6 sm:p-8 mb-4 sm:mb-6 hover:scale-105 transition-transform duration-300">
                  <Sparkles className="h-12 w-12 sm:h-16 sm:w-16 text-primary mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">2. IA Analyse</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">Notre IA analyse le contenu et le genre</p>
                </Card>
                <ArrowRight className="h-6 w-6 text-primary mx-auto hidden md:block rotate-90 md:rotate-0" />
              </div>

              {/* Step 3 */}
              <div className="text-center">
                <Card className="glass-card p-6 sm:p-8 mb-4 sm:mb-6 hover:scale-105 transition-transform duration-300">
                  <BookOpen className="h-12 w-12 sm:h-16 sm:w-16 text-primary mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">3. Couverture</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">Recevez votre couverture professionnelle</p>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="px-4 sm:px-6 py-12 sm:py-20">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-foreground mb-8 sm:mb-16">
              Pourquoi choisir DaWan Cover ?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              <Card className="glass-card p-4 sm:p-6 hover:scale-105 transition-transform duration-300">
                <Sparkles className="h-10 w-10 sm:h-12 sm:w-12 text-primary mb-3 sm:mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">IA Avancée</h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Technologie d'intelligence artificielle de pointe pour des résultats exceptionnels
                </p>
              </Card>

              <Card className="glass-card p-4 sm:p-6 hover:scale-105 transition-transform duration-300">
                <FileText className="h-10 w-10 sm:h-12 sm:w-12 text-primary mb-3 sm:mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">Analyse Intelligente</h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Analyse automatique du genre, du ton et du style de votre manuscrit
                </p>
              </Card>

              <Card className="glass-card p-4 sm:p-6 hover:scale-105 transition-transform duration-300 sm:col-span-2 lg:col-span-1">
                <BookOpen className="h-10 w-10 sm:h-12 sm:w-12 text-primary mb-3 sm:mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">Qualité Pro</h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Couvertures de qualité professionnelle prêtes pour l'impression
                </p>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="glass border-t border-border px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <span className="text-foreground font-semibold text-sm sm:text-base">DaWan Cover</span>
          </div>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">
              Mentions légales
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Politique de confidentialité
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              CGU
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
