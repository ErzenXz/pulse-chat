"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  MessageSquare,
  ArrowRight,
  CheckCircle,
  ChevronDown,
  Twitter,
  Instagram,
  Facebook,
  Linkedin,
} from "lucide-react"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"

export default function Home() {
  const [scrollY, setScrollY] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [activeTab, setActiveTab] = useState("personal")
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push('/conversations')
    }
  }, [loading, user, router])


  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 500)

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
      clearTimeout(timer)
    }
  }, [])

  if (loading) {
    return null
  }

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 md:pt-32 md:pb-40 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-[30%] -right-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-primary/20 to-primary/5 blur-3xl" />
          <div className="absolute -bottom-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-tr from-primary/10 to-primary/5 blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
            variants={staggerContainer}
          >
            <motion.div variants={fadeIn} className="mb-4 inline-block">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
                New Release v1.0
              </span>
            </motion.div>

            <motion.h1
              variants={fadeIn}
              className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70"
            >
              Messaging Reimagined
            </motion.h1>

            <motion.p variants={fadeIn} className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Connect with anyone, anywhere with our beautiful, secure, and feature-rich messaging platform.
            </motion.p>

            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button asChild size="lg" className="rounded-full text-base px-8 h-12">
                <Link href="/conversations">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>

              <Button variant="outline" size="lg" className="rounded-full text-base px-8 h-12">
                <Link href="#features" className="flex items-center">
                  Learn More
                  <ChevronDown className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </motion.div>

            {/* App Preview */}
            <motion.div variants={fadeIn} className="relative mx-auto max-w-5xl">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/5 rounded-3xl blur-3xl transform -translate-y-4 scale-95 opacity-70" />

              <div className="relative shadow-2xl rounded-3xl overflow-hidden border border-border/50 bg-card">
                <div className="aspect-[16/9] md:aspect-[2/1] overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1600267204091-5c1ab8b10c02?q=80&w=1600&auto=format&fit=crop"
                    alt="ErzenMessenger App Interface"
                    className="w-full h-full object-cover"
                  />

                  {/* Overlay with app UI mockup */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                    <div className="p-6 md:p-10 text-white">
                      <h3 className="text-2xl md:text-3xl font-bold mb-2">Beautiful Interface</h3>
                      <p className="text-white/80 max-w-md">
                        Designed with attention to detail for the best user experience
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32 bg-accent/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Powerful Features</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need for seamless communication in one beautiful app
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-card border border-border/50 rounded-2xl overflow-hidden group hover:shadow-lg transition-all duration-300"
              >
                <div className="h-48 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 group-hover:opacity-80 transition-opacity duration-300" />
                  <img
                    src={feature.image || "/placeholder.svg"}
                    alt={feature.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <div className="mb-4 bg-primary/10 p-3 rounded-full w-fit">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground mb-4">{feature.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {feature.tags.map((tag, i) => (
                      <span key={i} className="text-xs px-2 py-1 rounded-full bg-accent text-accent-foreground">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 md:py-32 relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-[10%] -left-[20%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-primary/10 to-primary/5 blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Getting started with ErzenMessenger is quick and easy
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto relative">
            {/* Remove this connecting line */}
            {/* <div className="hidden md:block absolute top-1/2 left-[16.67%] right-[16.67%] h-0.5 bg-primary/20" /> */}
            {howItWorks.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="flex flex-col items-center text-center relative z-10"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 relative">
                  <span className="text-2xl font-bold text-primary">{index + 1}</span>
                  <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping opacity-20" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Button asChild size="lg" className="rounded-full">
              <Link href="/conversations">
                Start Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 md:py-32 bg-accent/30" style={{ display: "none" }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Simple Pricing</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Choose the plan that works best for you</p>
          </div>

          <Tabs defaultValue="personal" className="max-w-5xl mx-auto" onValueChange={setActiveTab}>
            <div className="flex justify-center mb-8">
              <TabsList className="grid grid-cols-2 w-[400px]">
                <TabsTrigger value="personal" className="text-base">
                  Personal
                </TabsTrigger>
                <TabsTrigger value="business" className="text-base">
                  Business
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="personal" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {personalPlans.map((plan, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className={`bg-card border rounded-2xl overflow-hidden ${
                      plan.popular ? "border-primary shadow-lg relative" : "border-border/50"
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute top-0 right-0">
                        <div className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
                          POPULAR
                        </div>
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                      <div className="mb-4">
                        <span className="text-4xl font-bold">${plan.price}</span>
                        <span className="text-muted-foreground">/month</span>
                      </div>
                      <p className="text-muted-foreground mb-6">{plan.description}</p>
                      <Button
                        className={`w-full mb-6 ${plan.popular ? "" : "bg-primary/80 hover:bg-primary"}`}
                        variant={plan.popular ? "default" : "outline"}
                      >
                        Get Started
                      </Button>
                      <ul className="space-y-3">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="business" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {businessPlans.map((plan, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className={`bg-card border rounded-2xl overflow-hidden ${
                      plan.popular ? "border-primary shadow-lg relative" : "border-border/50"
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute top-0 right-0">
                        <div className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
                          POPULAR
                        </div>
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                      <div className="mb-4">
                        <span className="text-4xl font-bold">${plan.price}</span>
                        <span className="text-muted-foreground">/month</span>
                      </div>
                      <p className="text-muted-foreground mb-6">{plan.description}</p>
                      <Button
                        className={`w-full mb-6 ${plan.popular ? "" : "bg-primary/80 hover:bg-primary"}`}
                        variant={plan.popular ? "default" : "outline"}
                      >
                        Get Started
                      </Button>
                      <ul className="space-y-3">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 md:py-32 relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-[30%] -right-[20%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-primary/10 to-primary/5 blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">What Our Users Say</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of satisfied users who love ErzenMessenger
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-card border border-border/50 p-6 rounded-2xl"
              >
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full overflow-hidden mr-4">
                    <img
                      src={testimonial.avatar || "/placeholder.svg"}
                      alt={testimonial.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                  </div>
                </div>
                <p className="italic text-muted-foreground mb-4">&ldquo;{testimonial.quote}&rdquo;</p>
                <div className="flex text-amber-500">
                  {Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <svg key={i} className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 md:py-32 bg-accent/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Find answers to common questions about ErzenMessenger
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="grid gap-6">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-card border border-border/50 rounded-xl overflow-hidden"
                >
                  <details className="group">
                    <summary className="flex items-center justify-between p-6 cursor-pointer">
                      <h3 className="text-lg font-medium">{faq.question}</h3>
                      <span className="relative ml-2 flex-shrink-0">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-5 w-5 transition-transform group-open:rotate-180"
                        >
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </span>
                    </summary>
                    <div className="px-6 pb-6 pt-0">
                      <p className="text-muted-foreground">{faq.answer}</p>
                    </div>
                  </details>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mobile App Section */}
      <section className="py-20 md:py-32 relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-primary/10 to-primary/5 blur-3xl" />
        </div>

        <div className="container mx-auto px-8 md:px-16 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
            <div className="md:w-1/2">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl md:text-5xl font-bold mb-6">Take ErzenMessenger Everywhere</h2>
                <p className="text-xl text-muted-foreground mb-8">
                  Stay connected on the go with our mobile apps for iOS and Android. Never miss an important message
                  again.
                </p>

                <div className="flex flex-wrap gap-4 mb-8">
                  <a href="#" className="transition-transform hover:scale-105">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
                      alt="Download on the App Store"
                      className="h-12"
                    />
                  </a>
                  <a href="#" className="transition-transform hover:scale-105">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                      alt="Get it on Google Play"
                      className="h-12"
                    />
                  </a>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-10 w-10 rounded-full border-2 border-background overflow-hidden">
                        <img
                          src={`https://randomuser.me/api/portraits/men/${i + 10}.jpg`}
                          alt="User"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">Join 10,000+ users</div>
                    <div className="text-muted-foreground">who already downloaded the app</div>
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="md:w-1/2 relative">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/5 rounded-3xl blur-3xl transform -translate-y-4 scale-95 opacity-70" />

                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=1000&auto=format&fit=crop"
                    alt="ErzenMessenger Mobile App"
                    className="rounded-2xl shadow-2xl border border-border/50"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-4"
              >
                <div className="text-4xl md:text-5xl font-bold mb-2">{stat.value}</div>
                <div className="text-primary-foreground/80">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to get started?</h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Join thousands of users already enjoying ErzenMessenger. It&apos;s free to start!
            </p>

            <div className="bg-card border border-border/50 rounded-3xl p-8 md:p-12 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/5" />

              <div className="relative z-10">
                <h3 className="text-2xl md:text-3xl font-bold mb-6">Create your account today</h3>

                <ul className="flex flex-col md:flex-row gap-4 justify-center mb-8">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>

                <Button asChild size="lg" className="rounded-full text-base px-8 h-12">
                  <Link href="/conversations">
                    Get Started Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-accent/30 border-t border-border">
        <div className="container mx-auto px-4">
          {/* Top Footer */}
          <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <MessageSquare className="h-6 w-6 text-primary mr-2" />
                <span className="text-xl font-bold">ErzenMessenger</span>
              </div>
              <p className="text-muted-foreground mb-6 max-w-xs">
                A modern, secure messaging platform designed for seamless communication across all your devices.
              </p>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="h-10 w-10 rounded-full bg-background flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-background/80 transition-colors"
                >
                  <Twitter className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="h-10 w-10 rounded-full bg-background flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-background/80 transition-colors"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="h-10 w-10 rounded-full bg-background flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-background/80 transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="h-10 w-10 rounded-full bg-background flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-background/80 transition-colors"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-4">Product</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Security
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Enterprise
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    API
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-4">Company</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Press
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-4">Legal</h4>
              <h4 className="font-semibold text-lg mb-4">Legal</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="py-6 border-t border-border flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground mb-4 md:mb-0">
              © {new Date().getFullYear()} ErzenMessenger. All rights reserved.
            </p>

            <div className="flex flex-wrap gap-4 text-sm">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </a>
              <span className="text-muted-foreground">•</span>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service
              </a>
              <span className="text-muted-foreground">•</span>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Data
const features = [
  {
    title: "Real-time Messaging",
    description: "Instant message delivery with read receipts and typing indicators for seamless conversations.",
    icon: <MessageSquare className="h-6 w-6 text-primary" />,
    image: "https://images.unsplash.com/photo-1577563908411-5077b6dc7624?q=80&w=600&auto=format&fit=crop",
    tags: ["Instant", "Reliable", "Secure"],
  },
  {
    title: "Media Sharing",
    description: "Share photos, videos, documents, and more with easy file uploads and previews.",
    icon: (
      <svg
        className="h-6 w-6 text-primary"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop",
    tags: ["Photos", "Videos", "Files"],
  },
  {
    title: "Video Calls",
    description: "Start high-quality video calls directly from your conversations with just one click.",
    icon: (
      <svg
        className="h-6 w-6 text-primary"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
        />
      </svg>
    ),
    image: "https://images.unsplash.com/photo-1587614382346-4ec70e388b28?q=80&w=600&auto=format&fit=crop",
    tags: ["HD Quality", "Group Calls", "Screen Sharing"],
  },
]

const howItWorks = [
  {
    title: "Create an Account",
    description: "Sign up in seconds with just your email address and a password.",
  },
  {
    title: "Find Your Contacts",
    description: "Search for friends or import your contacts to connect instantly.",
  },
  {
    title: "Start Messaging",
    description: "Send messages, share media, and make video calls with ease.",
  },
]

const personalPlans = [
  {
    name: "Free",
    price: "0",
    description: "Perfect for getting started",
    popular: false,
    features: [
      "Unlimited text messages",
      "Basic media sharing",
      "1-on-1 video calls",
      "5GB storage",
      "Standard support",
    ],
  },
  {
    name: "Premium",
    price: "9.99",
    description: "For power users who need more",
    popular: true,
    features: [
      "Everything in Free",
      "Advanced media sharing",
      "Group video calls (up to 10)",
      "50GB storage",
      "Priority support",
      "Custom themes",
    ],
  },
  {
    name: "Family",
    price: "19.99",
    description: "Share with up to 6 family members",
    popular: false,
    features: [
      "Everything in Premium",
      "Family account sharing",
      "Parental controls",
      "100GB shared storage",
      "24/7 support",
      "Location sharing",
    ],
  },
]

const businessPlans = [
  {
    name: "Startup",
    price: "29.99",
    description: "For small teams getting started",
    popular: false,
    features: [
      "Up to 10 team members",
      "Team channels",
      "Basic integrations",
      "100GB storage",
      "Standard support",
      "Basic analytics",
    ],
  },
  {
    name: "Business",
    price: "49.99",
    description: "For growing businesses",
    popular: true,
    features: [
      "Up to 50 team members",
      "Advanced team management",
      "Advanced integrations",
      "500GB storage",
      "Priority support",
      "Advanced analytics",
      "Custom branding",
    ],
  },
  {
    name: "Enterprise",
    price: "99.99",
    description: "For large organizations",
    popular: false,
    features: [
      "Unlimited team members",
      "Enterprise-grade security",
      "Custom integrations",
      "Unlimited storage",
      "Dedicated support",
      "Advanced analytics",
      "Custom deployment options",
    ],
  },
]

const testimonials = [
  {
    name: "Sarah Johnson",
    title: "Product Designer",
    quote:
      "ErzenMessenger has completely transformed how our team communicates. The interface is beautiful and intuitive.",
    avatar: "https://randomuser.me/api/portraits/women/1.jpg",
  },
  {
    name: "Michael Chen",
    title: "Software Engineer",
    quote:
      "I've tried many messaging apps, but this one stands out with its performance and reliability. Highly recommended!",
    avatar: "https://randomuser.me/api/portraits/men/2.jpg",
  },
  {
    name: "Emily Rodriguez",
    title: "Marketing Director",
    quote: "The media sharing features are fantastic. It's made collaborating with my remote team so much easier.",
    avatar: "https://randomuser.me/api/portraits/women/3.jpg",
  },
]

const stats = [
  { value: "10M+", label: "Users" },
  { value: "150+", label: "Countries" },
  { value: "99.9%", label: "Uptime" },
  { value: "24/7", label: "Support" },
]

const benefits = ["Free to start", "No credit card required", "Cancel anytime"]

const faqs = [
  {
    question: "Is ErzenMessenger free to use?",
    answer:
      "Yes, ErzenMessenger offers a free plan with essential features. We also offer premium plans with additional features for individuals and businesses.",
  },
  {
    question: "How secure is ErzenMessenger?",
    answer:
      "ErzenMessenger uses end-to-end encryption for all messages and calls. Your conversations are private and secure, and we never sell your data to third parties.",
  },
  {
    question: "Can I use ErzenMessenger on multiple devices?",
    answer:
      "ErzenMessenger syncs across all your devices, including smartphones, tablets, and computers. Your conversations will always be up-to-date.",
  },
  {
    question: "Does ErzenMessenger work internationally?",
    answer:
      "Yes, ErzenMessenger works worldwide. You can message anyone, anywhere, as long as they have an internet connection and the app installed.",
  },
  {
    question: "How do I add new contacts?",
    answer:
      "You can add contacts by searching for their username, scanning their QR code, or importing contacts from your phone. We make it easy to connect with friends and colleagues.",
  },
]

