import type { ComponentConfig } from '@simforge/types';

type IconComponent = React.FC<{ size?: number }>;

/**
 * Cloud-specific icons keyed by preset ID.
 *
 * Gradient backgrounds match the official AWS Architecture Icons color scheme:
 *   - Compute:           #C8511B → #FF9900
 *   - App Integration:   #B0084D → #FF4F8B
 *   - Database:          #2E27AD → #527FFF
 *   - Networking:        #4D27A8 → #A166FF
 *
 * GCP uses #4285F4 (Google Blue) and Azure uses #0078D4 (Azure Blue).
 *
 * White icon shapes are simplified versions of the official silhouettes,
 * optimized for legibility at 18–32px rendering sizes.
 */
const cloudIcons: Record<string, IconComponent> = {
  // ── AWS Services ────────────────────────────────────────────────────

  // Lambda — official λ symbol (Compute: orange gradient)
  'aws-lambda': ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <defs><linearGradient id="gc-lambda" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stopColor="#C8511B"/><stop offset="100%" stopColor="#FF9900"/></linearGradient></defs>
      <rect width="64" height="64" fill="url(#gc-lambda)"/>
      <path d="M22.68,52H13.57L23.84,30.41l4.56,9.45L22.68,52ZM24.73,27.67a1.42,1.42,0,0,0-1.9.05L11.1,52.57a1.36,1.36,0,0,0,.06.97,1.38,1.38,0,0,0,.84.47H23.31a1.41,1.41,0,0,0,.9-.57l6.2-13.14a1.37,1.37,0,0,0-.01-.86ZM51.01,52H41.99L26.95,19.58a1.42,1.42,0,0,0-.9-.58H20.13l.01-7h11.68L46.77,44.42a1.42,1.42,0,0,0,.91.58h3.33v7Zm1-9H48.31L33.35,10.58a1.42,1.42,0,0,0-.9-.58H19.14a1,1,0,0,0-1,1l-.01,9a1,1,0,0,0,1,1h6.29l15.03,32.42a1.42,1.42,0,0,0,.91.58H52a1,1,0,0,0,1-1V44a1,1,0,0,0-1-1Z" fill="#FFFFFF"/>
    </svg>
  ),

  // ECS Fargate — container hexagons (Compute: orange gradient)
  'aws-ecs-fargate': ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <defs><linearGradient id="gc-ecs" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stopColor="#C8511B"/><stop offset="100%" stopColor="#FF9900"/></linearGradient></defs>
      <rect width="48" height="48" fill="url(#gc-ecs)"/>
      <path d="M33.5,21.3l-5,2.9V31l5,2.9,5-2.9V24.2Zm3,10.4-3,1.7-3-1.7V25.4l3-1.7,3,1.7Z" fill="#FFFFFF"/>
      <path d="M20.5,12.3l-5,2.9V22l5,2.9,5-2.9V15.2Zm3,10.4-3,1.7-3-1.7V16.4l3-1.7,3,1.7Z" fill="#FFFFFF"/>
      <path d="M20.5,30.3l-5,2.9V40l5,2.9,5-2.9V33.2Zm3,10.4-3,1.7-3-1.7V34.4l3-1.7,3,1.7Z" fill="#FFFFFF"/>
    </svg>
  ),

  // SQS — official messaging arrows (App Integration: pink gradient)
  'aws-sqs': ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <defs><linearGradient id="gc-sqs" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stopColor="#B0084D"/><stop offset="100%" stopColor="#FF4F8B"/></linearGradient></defs>
      <rect width="64" height="64" fill="url(#gc-sqs)"/>
      <path d="M23.85,35.51l2-2.95a.99.99,0,0,0,0-1.1l-2-3L22.18,29.58l.96,1.43H20v2h3.15l-.97,1.43Zm18,0,2-2.96a.99.99,0,0,0,0-1.1l-2-3-1.66,1.1.96,1.43H38v2h3.14l-.96,1.42Z" fill="#FFFFFF"/>
      <path d="M28.49,32a8.13,8.13,0,0,1-.66,4.15,11.2,11.2,0,0,1,8.38,0A8.13,8.13,0,0,1,35.54,32a8.13,8.13,0,0,1,.66-4.15,11.2,11.2,0,0,1-8.38,0A8.13,8.13,0,0,1,28.49,32Z" fill="#FFFFFF" opacity=".5"/>
      <path d="M24.3,39.62a1.41,1.41,0,0,0,1.41-1.4,1.41,1.41,0,0,0-1.41-1.4c-3.41-3.37-3.41-10.23,0-13.6a1.41,1.41,0,0,0,1.41-1.4,1.41,1.41,0,0,0-1.41-1.4c5.87-5.83,14.57-5.83,20.44,0a1.41,1.41,0,0,0,0,2.8c-3.41,3.37-3.41,10.23,0,13.6a1.41,1.41,0,0,0,0,2.8c-5.87,5.83-14.57,5.83-20.44,0Z" fill="none" stroke="#FFFFFF" strokeWidth="1.5"/>
      <circle cx="49.5" cy="32" r="3.5" fill="none" stroke="#FFFFFF" strokeWidth="1.5"/>
      <circle cx="14.5" cy="32" r="3.5" fill="none" stroke="#FFFFFF" strokeWidth="1.5"/>
    </svg>
  ),

  // SNS — official notification hub (App Integration: pink gradient)
  'aws-sns': ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <defs><linearGradient id="gc-sns" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stopColor="#B0084D"/><stop offset="100%" stopColor="#FF4F8B"/></linearGradient></defs>
      <rect width="64" height="64" fill="url(#gc-sns)"/>
      <circle cx="14" cy="32" r="2" fill="#FFFFFF"/>
      <circle cx="51" cy="32" r="2" fill="#FFFFFF"/>
      <circle cx="49" cy="20" r="2" fill="#FFFFFF"/>
      <circle cx="49" cy="44" r="2" fill="#FFFFFF"/>
      <path d="M37,31v2h5.19A3,3,0,1,0,48.19,31H44V21h2.19A3,3,0,1,0,46.19,19H43a1,1,0,0,0-1,1V31H37Zm0,2h5v11a1,1,0,0,0,1,1h3.19A3,3,0,1,0,46.19,43H44V33Z" fill="#FFFFFF"/>
      <path d="M16.82,33A3,3,0,1,1,15.15,29.23c1.63-9.49,9.33-15.77,18.25-15.77,4.19,0,7.19.84,10.03,2.82l1.14-1.64C41.41,12.98,37.97,12,33.4,12,23.39,12,14.83,19.32,13.14,29.14A3,3,0,0,0,13.14,34.86c1.74,10.39,10.06,18.14,20,18.14,4.23,0,8.33-1.41,12.19-4.19l-1.17-1.62C40.91,49.72,37.2,51,33.4,51,24.51,51,16.82,44.08,15.15,34.77A3,3,0,0,1,16.82,33Z" fill="#FFFFFF"/>
      <path d="M29.43,28a6.68,6.68,0,0,0,4.18,2A6.68,6.68,0,0,0,37,28h-2.38l-1.07-1.84,2.08-1.05L32,22.41l-3.38,3.13,2.08,.85L29.43,28Z" fill="#FFFFFF"/>
    </svg>
  ),

  // RDS — official DB cylinder with sync arrows (Database: blue gradient)
  'aws-rds': ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <defs><linearGradient id="gc-rds" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stopColor="#2E27AD"/><stop offset="100%" stopColor="#527FFF"/></linearGradient></defs>
      <rect width="64" height="64" fill="url(#gc-rds)"/>
      <path d="M54,11v8H52V13.41l-6.29,6.3-1.41-1.42L50.59,12H45.13V10H53A1,1,0,0,1,54,11ZM12,18.88H10V11a1,1,0,0,1,1-1h8v2H13.41l6.3,6.29-1.41,1.42L12,13.41Zm7.71,26.83L13.41,52h5.46v2H11a1,1,0,0,1-1-1V45h2v5.59l6.29-6.3ZM52,45.13h2V53a1,1,0,0,1-1,1H45v-2h5.59l-6.3-6.29,1.41-1.42L52,50.59Z" fill="#FFFFFF"/>
      <path d="M32,22.19c5,0,7.98,1.18,7.98,1.7S37,25.59,32,25.59s-8-1.23-8-1.65v-.06c.23-.5,2.91-1.69,8-1.69ZM32,20.19c-3.71,0-10,.78-10,3.7V40.35c0,2.69,5.18,3.92,10,3.92s10-1.23,10-3.92V23.89c0-2.92-6.29-3.7-10-3.7Z" fill="#FFFFFF"/>
      <path d="M24,26.26v3.22c.11.58,2.98,1.92,8.02,1.92s7.87-1.34,8.03-1.92V26.26C38.06,27.27,34.85,27.59,32,27.59S25.95,27.27,24,26.26Z" fill="#FFFFFF" opacity=".6"/>
      <path d="M24,31.96v3.25c.11.58,2.98,1.92,8.02,1.92s7.87-1.35,8.03-1.92V31.96C38.06,32.94,34.97,33.4,32.02,33.4S25.95,32.94,24,31.96Z" fill="#FFFFFF" opacity=".6"/>
      <path d="M24,37.68v2.66c.1.58,2.97,1.92,8,1.92s7.9-1.35,8-1.93V37.69C38.06,38.67,34.97,39.13,32.02,39.13S25.95,38.67,24,37.68Z" fill="#FFFFFF" opacity=".6"/>
    </svg>
  ),

  // DynamoDB — official lightning+table (Database: blue gradient)
  'aws-dynamodb': ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <defs><linearGradient id="gc-ddb" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stopColor="#2E27AD"/><stop offset="100%" stopColor="#527FFF"/></linearGradient></defs>
      <rect width="64" height="64" fill="url(#gc-ddb)"/>
      <path d="M46.59,25.25H43a1.42,1.42,0,0,1-.82-.29,1.42,1.42,0,0,1-.19-1.22l2.49-6.72-8.91,0-4.09,9.1H36a1.42,1.42,0,0,1,.81.68,1.37,1.37,0,0,1-.05.91l-3.66,11.1L46.59,25.25ZM49.71,24.95,31.71,43.15a1.41,1.41,0,0,1-1.05.3,1.31,1.31,0,0,1-.9-1.13l4.56-13.83h-4.61a1.42,1.42,0,0,1-.84-.46,1.42,1.42,0,0,1,.13-.97l5-11.12a1.42,1.42,0,0,1,.91-.59H46a1.42,1.42,0,0,1,.82.29,1.42,1.42,0,0,1,.12,1.22l-2.49,6.72H49a1.42,1.42,0,0,1,.71,2.37Z" fill="#FFFFFF"/>
      <path d="M41,44.22c-2.71,1.89-7.69,2.88-12.47,2.88s-9.82-.99-12.53-2.92v3.82c0,1.66,4.77,3.98,12.53,3.98S41,49.76,41,47.49ZM43.06,40.95v6.53c0,3-5.22,6.51-14.4,6.51-6.9,0-13.06-1.89-14-5.5h-.06V30.3h0V16.15h0C14,12.16,21.49,10,28.53,10c3.94,0,7.73.64,10.4,1.76l-.77,1.87c-2.43-1.02-5.94-1.63-9.63-1.63-7.76,0-12.53,2.41-12.53,4.13s4.77,4.13,12.53,4.13l.6-.01.08,2.02c-.23.01-.46.01-.68.01-4.82,0-9.84-1.01-12.53-2.92v4.36h0v.02c.01.53.49,1.14,1.36,1.72,1.98,1.23,5.55,2.11,9.54,2.29l-.09,2.02c-4.13-.19-7.84-1.07-10.17-2.42-.31.3-.73,1.06-.73,1.47,0,1.72,4.77,4.13,12.53,4.13.74,0,1.47-.03,2.16-.07l.14,2.02c-.74.05-1.52.07-2.3.07-4.82,0-9.84-1.01-12.53-2.92v3.67h0c.01.53.49,1.14,1.36,1.72,2.27,1.47,6.56,2.39,11.07,2.39l.33,0v2.02l-.33,0c-4.78,0-9.78-1.01-12.53-2.54-.32.3,0,1.01,0,1.55,0,1.72,4.77,4.13,12.53,4.13s12.53-2.4,12.53-4.13c0-.61-.6-1.17-1.09-1.54Z" fill="#FFFFFF"/>
    </svg>
  ),

  // ElastiCache — official cache chip (Database: blue gradient)
  'aws-elasticache': ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <defs><linearGradient id="gc-ec" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stopColor="#2E27AD"/><stop offset="100%" stopColor="#527FFF"/></linearGradient></defs>
      <rect width="64" height="64" fill="url(#gc-ec)"/>
      <rect x="11" y="12" width="42" height="6" rx="1" fill="#FFFFFF" opacity=".5"/>
      <rect x="16" y="16" width="4" height="7" rx=".5" fill="#FFFFFF"/>
      <rect x="22" y="16" width="4" height="5" rx=".5" fill="#FFFFFF"/>
      <rect x="28" y="16" width="4" height="5" rx=".5" fill="#FFFFFF"/>
      <rect x="38" y="16" width="4" height="5" rx=".5" fill="#FFFFFF"/>
      <rect x="44" y="16" width="4" height="7" rx=".5" fill="#FFFFFF"/>
      <ellipse cx="31.66" cy="27.87" rx="10" ry="4.37" fill="#FFFFFF" opacity=".7"/>
      <path d="M21.95,27.87v7.41c0,.95,2.45,2.36,9.71,2.36,5.51,0,8.39-1.54,8.39-2.36V27.87c-1.99,1.1-5.19,1.63-8.39,1.63S23.95,28.97,21.95,27.87Z" fill="#FFFFFF" opacity=".5"/>
      <path d="M21.95,35.28v6.73c0,.95,2.45,2.36,9.71,2.36,5.51,0,8.39-1.54,8.39-2.36V35.28c-1.99,1.1-5.19,1.63-8.39,1.63S23.95,36.38,21.95,35.28Z" fill="#FFFFFF" opacity=".5"/>
      <path d="M21.95,42v6.66c0,1,2.68,2.34,9.72,2.34,5.5,0,8.38-1.52,8.38-2.34V42c-1.99,1.1-5.19,1.63-8.39,1.63S23.95,43.1,21.95,42Z" fill="#FFFFFF" opacity=".5"/>
      <rect x="13" y="33" width="6" height="2" rx=".5" fill="#FFFFFF"/>
      <rect x="45" y="33" width="6" height="2" rx=".5" fill="#FFFFFF"/>
      <rect x="13" y="37" width="6" height="2" rx=".5" fill="#FFFFFF"/>
      <rect x="45" y="37" width="6" height="2" rx=".5" fill="#FFFFFF"/>
    </svg>
  ),

  // DAX — accelerator (Database: blue gradient)
  'aws-dax': ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <defs><linearGradient id="gc-dax" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stopColor="#2E27AD"/><stop offset="100%" stopColor="#527FFF"/></linearGradient></defs>
      <rect width="64" height="64" fill="url(#gc-dax)"/>
      <path d="M14,42a14,14,0,0,1,28,0" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"/>
      <line x1="28" y1="42" x2="36" y2="24" stroke="white" strokeWidth="3" strokeLinecap="round"/>
      <circle cx="28" cy="42" r="3" fill="white"/>
      <text x="40" y="50" fill="white" fontSize="12" fontWeight="bold" fontFamily="sans-serif">DAX</text>
    </svg>
  ),

  // API Gateway — official gateway icon (App Integration: pink gradient)
  'aws-api-gateway': ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 80 80" aria-hidden="true">
      <defs><linearGradient id="gc-apigw" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stopColor="#B0084D"/><stop offset="100%" stopColor="#FF4F8B"/></linearGradient></defs>
      <rect width="80" height="80" fill="url(#gc-apigw)"/>
      <g transform="translate(8,8)" fill="#FFFFFF">
        <path d="M19,6.63,6,13.08V53.19L19,57.59ZM21,19.39V45.62h3v2H21V59a1,1,0,0,1-1.42.81L4.68,54.88A1,1,0,0,1,4,53.92V12.45a1,1,0,0,1,.56-.9L19.56,4.1A1,1,0,0,1,21,5.01V17.38h3v2Z"/>
        <path d="M58,13.08,45,6.63V57.59l13-4.4ZM60,53.92a1,1,0,0,1-.68.96l-15,5.07A1,1,0,0,1,43,59V47.63h2.07V45.62H43V19.39h2.07V17.38H43V5.01a1,1,0,0,1,1.44-.86l15,7.45a1,1,0,0,1,.56.9Z"/>
        <path d="M26.07,47.63H29v2H26.07Zm5,0H34v2H31Zm5,0H39v2H36Zm0-28.24H39v-2H36.07Zm-5,0H34v-2H31.07Zm-5,0H29v-2H26.07Z"/>
        <path d="M34.93,25.81l-1.87-.72-5,13.11,1.87.72ZM41.71,32.21a1,1,0,0,0,0-1.43l-4-4.03-1.41,1.43,3.29,3.32-3.29,3.32,1.41,1.43ZM26.29,36.24l-4-4.04a1,1,0,0,0,0-1.43l4-4.03,1.41,1.43-3.29,3.32,3.29,3.32Z"/>
      </g>
    </svg>
  ),

  // ALB — official load balancer (Networking: purple gradient)
  'aws-alb': ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <defs><linearGradient id="gc-alb" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stopColor="#4D27A8"/><stop offset="100%" stopColor="#A166FF"/></linearGradient></defs>
      <rect width="64" height="64" fill="url(#gc-alb)"/>
      <path d="M23.5,42A10.5,10.5,0,1,1,34,31.5,10.51,10.51,0,0,1,23.5,42Z" fill="none" stroke="#FFFFFF" strokeWidth="2"/>
      <circle cx="48" cy="32" r="3" fill="none" stroke="#FFFFFF" strokeWidth="2"/>
      <circle cx="45" cy="16" r="3" fill="none" stroke="#FFFFFF" strokeWidth="2"/>
      <circle cx="45" cy="48" r="3" fill="none" stroke="#FFFFFF" strokeWidth="2"/>
      <line x1="34" y1="31" x2="45" y2="32" stroke="#FFFFFF" strokeWidth="2"/>
      <line x1="33" y1="26" x2="43" y2="18" stroke="#FFFFFF" strokeWidth="2"/>
      <line x1="33" y1="37" x2="43" y2="46" stroke="#FFFFFF" strokeWidth="2"/>
    </svg>
  ),

  // NLB — same style as ELB (Networking: purple gradient)
  'aws-nlb': ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <defs><linearGradient id="gc-nlb" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stopColor="#4D27A8"/><stop offset="100%" stopColor="#A166FF"/></linearGradient></defs>
      <rect width="64" height="64" fill="url(#gc-nlb)"/>
      <circle cx="23.5" cy="31.5" r="10.5" fill="none" stroke="#FFFFFF" strokeWidth="2"/>
      <circle cx="48" cy="32" r="3" fill="none" stroke="#FFFFFF" strokeWidth="2"/>
      <circle cx="45" cy="16" r="3" fill="none" stroke="#FFFFFF" strokeWidth="2"/>
      <circle cx="45" cy="48" r="3" fill="none" stroke="#FFFFFF" strokeWidth="2"/>
      <line x1="34" y1="31" x2="45" y2="32" stroke="#FFFFFF" strokeWidth="2"/>
      <line x1="33" y1="26" x2="43" y2="18" stroke="#FFFFFF" strokeWidth="2"/>
      <line x1="33" y1="37" x2="43" y2="46" stroke="#FFFFFF" strokeWidth="2"/>
      <text x="23.5" y="35" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold" fontFamily="sans-serif">4</text>
    </svg>
  ),

  // ── GCP Services (#4285F4) ──────────────────────────────────────────
  // Cloud Run
  'gcp-cloud-run': ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <rect width="24" height="24" rx="3" fill="#4285F4"/>
      <path d="M6,6 L11,3 L16,6 L16,12 L11,15 L6,12Z" fill="none" stroke="white" strokeWidth="1.2"/>
      <polygon points="10,7.5 10,12.5 14,10" fill="white"/>
    </svg>
  ),

  // Pub/Sub
  'gcp-pub-sub': ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <rect width="24" height="24" rx="3" fill="#4285F4"/>
      <circle cx="12" cy="12" r="2.5" fill="white"/>
      <circle cx="5.5" cy="7" r="1.5" fill="white"/>
      <circle cx="18.5" cy="7" r="1.5" fill="white"/>
      <circle cx="5.5" cy="17" r="1.5" fill="white"/>
      <circle cx="18.5" cy="17" r="1.5" fill="white"/>
      <line x1="9.8" y1="10.5" x2="6.8" y2="8.2" stroke="white" strokeWidth="1.3"/>
      <line x1="14.2" y1="10.5" x2="17.2" y2="8.2" stroke="white" strokeWidth="1.3"/>
      <line x1="9.8" y1="13.5" x2="6.8" y2="15.8" stroke="white" strokeWidth="1.3"/>
      <line x1="14.2" y1="13.5" x2="17.2" y2="15.8" stroke="white" strokeWidth="1.3"/>
    </svg>
  ),

  // Cloud SQL
  'gcp-cloud-sql': ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <rect width="24" height="24" rx="3" fill="#4285F4"/>
      <ellipse cx="12" cy="9" rx="5" ry="2" fill="white"/>
      <path d="M7,9v7c0,1.1,2.2,2,5,2s5-.9,5-2V9" fill="none" stroke="white" strokeWidth="1.5"/>
      <path d="M17,13c0,1.1-2.2,2-5,2s-5-.9-5-2" fill="none" stroke="white" strokeWidth="1"/>
    </svg>
  ),

  // Firestore
  'gcp-firestore': ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <rect width="24" height="24" rx="3" fill="#4285F4"/>
      <path d="M7,4h7l4,4v12a1,1,0,0,1-1,1H7a1,1,0,0,1-1-1V5A1,1,0,0,1,7,4z" fill="none" stroke="white" strokeWidth="1.3"/>
      <path d="M12,10c0-1.5.8-2.2,1-2.5s.5,1,.5,1.5-.8,2-1,2.5.8,1,1,1.5c0,1.2-1,2-1.5,2s-1.5-.8-1.5-2c0-.8.5-1.2,1-1.7s.5-.8.5-1.3z" fill="white"/>
    </svg>
  ),

  // Memorystore
  'gcp-memorystore': ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <rect width="24" height="24" rx="3" fill="#4285F4"/>
      <rect x="6" y="7" width="12" height="10" rx="1.5" fill="none" stroke="white" strokeWidth="1.5"/>
      <line x1="8.5" y1="7" x2="8.5" y2="4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="12" y1="7" x2="12" y2="4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="15.5" y1="7" x2="15.5" y2="4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="8.5" y1="17" x2="8.5" y2="19.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="12" y1="17" x2="12" y2="19.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="15.5" y1="17" x2="15.5" y2="19.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),

  // Cloud Endpoints
  'gcp-cloud-endpoints': ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <rect width="24" height="24" rx="3" fill="#4285F4"/>
      <path d="M12,4l6,3v5c0,4-2.7,7-6,8-3.3-1-6-4-6-8V7l6-3z" fill="none" stroke="white" strokeWidth="1.5"/>
      <polyline points="9,12 11,14.5 15.5,9.5" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  // Cloud LB
  'gcp-cloud-lb': ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <rect width="24" height="24" rx="3" fill="#4285F4"/>
      <circle cx="8" cy="12" r="4" fill="none" stroke="white" strokeWidth="1.5"/>
      <circle cx="18" cy="7" r="2" fill="white"/>
      <circle cx="18" cy="12" r="2" fill="white"/>
      <circle cx="18" cy="17" r="2" fill="white"/>
      <line x1="12" y1="10" x2="16" y2="7" stroke="white" strokeWidth="1.2"/>
      <line x1="12" y1="12" x2="16" y2="12" stroke="white" strokeWidth="1.2"/>
      <line x1="12" y1="14" x2="16" y2="17" stroke="white" strokeWidth="1.2"/>
    </svg>
  ),

  // ── Azure Services (#0078D4) ────────────────────────────────────────
  // Azure Functions
  'azure-functions': ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <rect width="24" height="24" rx="3" fill="#0078D4"/>
      <path d="M13,4L7,13h4.5l-1,7,6.5-9H12.5L13,4z" fill="white"/>
    </svg>
  ),

  // Service Bus
  'azure-service-bus': ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <rect width="24" height="24" rx="3" fill="#0078D4"/>
      <rect x="4" y="6" width="16" height="3" rx="1" fill="white"/>
      <rect x="4" y="15" width="16" height="3" rx="1" fill="white"/>
      <rect x="10.5" y="9" width="3" height="6" rx=".5" fill="white"/>
      <circle cx="6" cy="12" r="1.2" fill="white"/>
      <circle cx="18" cy="12" r="1.2" fill="white"/>
    </svg>
  ),

  // Cosmos DB
  'azure-cosmos-db': ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <rect width="24" height="24" rx="3" fill="#0078D4"/>
      <circle cx="12" cy="12" r="4" fill="none" stroke="white" strokeWidth="1.3"/>
      <ellipse cx="12" cy="12" rx="8" ry="3" fill="none" stroke="white" strokeWidth="1.2" transform="rotate(-30,12,12)"/>
      <ellipse cx="12" cy="12" rx="8" ry="3" fill="none" stroke="white" strokeWidth="1.2" transform="rotate(30,12,12)"/>
      <circle cx="12" cy="12" r="1.5" fill="white"/>
    </svg>
  ),

  // Azure Cache for Redis
  'azure-cache-redis': ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <rect width="24" height="24" rx="3" fill="#0078D4"/>
      <polygon points="12,4 20,12 12,20 4,12" fill="none" stroke="white" strokeWidth="1.8" strokeLinejoin="round"/>
      <polygon points="12,8 16,12 12,16 8,12" fill="white"/>
    </svg>
  ),

  // API Management
  'azure-api-management': ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <rect width="24" height="24" rx="3" fill="#0078D4"/>
      <path d="M6,16h12a4,4,0,0,0,0-8,3,3,0,0,0-3-3,5,5,0,0,0-9.5,2A3.5,3.5,0,0,0,6,16z" fill="white"/>
      <text x="12" y="14.5" textAnchor="middle" fill="#0078D4" fontSize="5.5" fontWeight="bold" fontFamily="sans-serif">API</text>
    </svg>
  ),

  // Azure LB
  'azure-lb': ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <rect width="24" height="24" rx="3" fill="#0078D4"/>
      <circle cx="8" cy="12" r="4" fill="none" stroke="white" strokeWidth="1.5"/>
      <circle cx="18" cy="7" r="2" fill="white"/>
      <circle cx="18" cy="12" r="2" fill="white"/>
      <circle cx="18" cy="17" r="2" fill="white"/>
      <line x1="12" y1="10" x2="16" y2="7" stroke="white" strokeWidth="1.2"/>
      <line x1="12" y1="12" x2="16" y2="12" stroke="white" strokeWidth="1.2"/>
      <line x1="12" y1="14" x2="16" y2="17" stroke="white" strokeWidth="1.2"/>
    </svg>
  ),
};

// Generic/default icons keyed by component kind
const genericIcons: Record<string, IconComponent> = {
  client: ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  service: ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  'load-balancer': ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" y1="2" x2="12" y2="6" />
      <line x1="12" y1="18" x2="12" y2="22" />
      <circle cx="12" cy="12" r="4" />
      <line x1="4" y1="12" x2="8" y2="12" />
      <line x1="16" y1="12" x2="20" y2="12" />
      <line x1="5.6" y1="5.6" x2="8.5" y2="8.5" />
      <line x1="15.5" y1="15.5" x2="18.4" y2="18.4" />
      <line x1="5.6" y1="18.4" x2="8.5" y2="15.5" />
      <line x1="15.5" y1="8.5" x2="18.4" y2="5.6" />
    </svg>
  ),
  queue: ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="4" rx="1" />
      <rect x="3" y="10" width="18" height="4" rx="1" />
      <rect x="3" y="17" width="18" height="4" rx="1" />
    </svg>
  ),
  database: ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <ellipse cx="12" cy="5" rx="7" ry="3" />
      <path d="M5 5v14c0 1.7 3.1 3 7 3s7-1.3 7-3V5" />
      <path d="M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3" />
    </svg>
  ),
  cache: ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="5" width="16" height="5" rx="1" />
      <rect x="4" y="11" width="16" height="5" rx="1" />
      <rect x="4" y="17" width="16" height="2" rx="1" />
    </svg>
  ),
  'api-gateway': ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2l7 4v6c0 5-3.5 9-7 10-3.5-1-7-5-7-10V6l7-4z" />
      <path d="M9 12h6" />
    </svg>
  ),
};

/**
 * Get the appropriate icon for a node.
 * If a presetId is provided and has a cloud-specific icon, use that.
 * Otherwise fall back to the generic icon for the component kind.
 */
export function getNodeIcon(
  kind: ComponentConfig['kind'],
  presetId?: string,
): IconComponent {
  if (presetId && presetId in cloudIcons) {
    return cloudIcons[presetId]!;
  }
  return (kind in genericIcons ? genericIcons[kind]! : genericIcons['service']!);
}
