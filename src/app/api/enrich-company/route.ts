import { NextRequest, NextResponse } from 'next/server'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

interface EnrichRequest {
  website: string
  name: string
  existingLogo?: string
}

interface CompanyData {
  description: string | null
  industry: string | null
  size: string | null
  logo: string | null
}

async function fetchWebsiteContent(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CompanyEnricher/1.0)',
      },
      signal: AbortSignal.timeout(10000),
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`)
    }

    const html = await response.text()
    // Extract text content, remove scripts and styles
    const textContent = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 8000) // Limit content length

    return textContent
  } catch (error) {
    console.error('Error fetching website:', error)
    return ''
  }
}

async function extractLogoFromWebsite(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CompanyEnricher/1.0)',
      },
      signal: AbortSignal.timeout(10000),
    })

    if (!response.ok) return null

    const html = await response.text()
    const baseUrl = new URL(url)

    // Try to find logo in common patterns
    const logoPatterns = [
      // Open Graph image
      /<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i,
      // Twitter image
      /<meta[^>]*name="twitter:image"[^>]*content="([^"]+)"/i,
      // Favicon/icon
      /<link[^>]*rel="(?:shortcut )?icon"[^>]*href="([^"]+)"/i,
      /<link[^>]*rel="apple-touch-icon"[^>]*href="([^"]+)"/i,
      // Logo in img tags
      /<img[^>]*(?:class|id|alt)="[^"]*logo[^"]*"[^>]*src="([^"]+)"/i,
      /<img[^>]*src="([^"]+)"[^>]*(?:class|id|alt)="[^"]*logo[^"]*"/i,
      // Logo in src with logo in filename
      /<img[^>]*src="([^"]*logo[^"]+)"/i,
    ]

    for (const pattern of logoPatterns) {
      const match = html.match(pattern)
      if (match && match[1]) {
        let logoUrl = match[1]
        // Handle relative URLs
        if (logoUrl.startsWith('//')) {
          logoUrl = `https:${logoUrl}`
        } else if (logoUrl.startsWith('/')) {
          logoUrl = `${baseUrl.origin}${logoUrl}`
        } else if (!logoUrl.startsWith('http')) {
          logoUrl = `${baseUrl.origin}/${logoUrl}`
        }
        return logoUrl
      }
    }

    // Fallback to Google's favicon service
    return `https://www.google.com/s2/favicons?domain=${baseUrl.hostname}&sz=128`
  } catch (error) {
    console.error('Error extracting logo:', error)
    return null
  }
}

async function enrichWithGemini(websiteContent: string, companyName: string): Promise<Partial<CompanyData>> {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
    // Return mock data if no API key
    return {
      description: null,
      industry: null,
      size: null,
    }
  }

  try {
    const prompt = `Analyze the following website content for a company called "${companyName}" and extract the following information. Return ONLY a valid JSON object with these fields:
- description: A brief 1-2 sentence description of what the company does (string or null)
- industry: The primary industry/sector (e.g., "Technology", "Healthcare", "Finance", "E-commerce", "SaaS", etc.) (string or null)
- size: Estimated company size if mentioned (e.g., "1-10", "11-50", "51-200", "201-500", "500+") (string or null)

Website content:
${websiteContent}

Return only the JSON object, no markdown formatting or explanation.`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 500,
          },
        }),
      }
    )

    if (!response.ok) {
      console.error('Gemini API error:', await response.text())
      return {}
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        description: parsed.description || null,
        industry: parsed.industry || null,
        size: parsed.size || null,
      }
    }
  } catch (error) {
    console.error('Error with Gemini:', error)
  }

  return {}
}

export async function POST(request: NextRequest) {
  try {
    const body: EnrichRequest = await request.json()
    const { website, name, existingLogo } = body

    if (!website || !name) {
      return NextResponse.json(
        { error: 'Website and name are required' },
        { status: 400 }
      )
    }

    // Fetch website content and logo in parallel
    const [websiteContent, extractedLogo] = await Promise.all([
      fetchWebsiteContent(website),
      existingLogo ? Promise.resolve(null) : extractLogoFromWebsite(website),
    ])

    // Enrich with Gemini
    const enrichedData = await enrichWithGemini(websiteContent, name)

    const result: CompanyData = {
      description: enrichedData.description || null,
      industry: enrichedData.industry || null,
      size: enrichedData.size || null,
      logo: existingLogo || extractedLogo,
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in enrich-company API:', error)
    return NextResponse.json(
      { error: 'Failed to enrich company data' },
      { status: 500 }
    )
  }
}
