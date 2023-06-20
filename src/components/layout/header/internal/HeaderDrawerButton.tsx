'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { memo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { atom, useAtom } from 'jotai'
import Link from 'next/link'
import type { SVGProps } from 'react'

import { CloseIcon } from '~/components/icons/close'
import { MotionButtonBase } from '~/components/ui/button'
import { DialogOverlay } from '~/components/ui/dlalog/DialogOverlay'
import { reboundPreset } from '~/constants/spring'
import { useIsClient } from '~/hooks/common/use-is-client'
import { jotaiStore } from '~/lib/store'

import { HeaderActionButton } from './HeaderActionButton'
import { useHeaderConfig } from './HeaderDataConfigureProvider'

function IcBaselineMenuOpen(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="M3 18h13v-2H3v2zm0-5h10v-2H3v2zm0-7v2h13V6H3zm18 9.59L17.42 12L21 8.41L19.59 7l-5 5l5 5L21 15.59z"
      />
    </svg>
  )
}

const drawerOpenAtom = atom(false)
export const HeaderDrawerButton = () => {
  const [open, setOpen] = useAtom(drawerOpenAtom)

  const isClient = useIsClient()
  const ButtonElement = (
    <HeaderActionButton>
      <IcBaselineMenuOpen />
    </HeaderActionButton>
  )
  if (!isClient) return ButtonElement

  return (
    <Dialog.Root open={open} onOpenChange={(open) => setOpen(open)}>
      <Dialog.Trigger asChild>{ButtonElement}</Dialog.Trigger>
      <Dialog.Portal forceMount>
        <div>
          <AnimatePresence>
            {open && (
              <>
                <DialogOverlay />

                <Dialog.Content>
                  <motion.dialog
                    className="fixed inset-0 z-[12] flex max-h-[100vh] min-h-0 items-center justify-center overflow-hidden rounded-xl bg-base-100/90"
                    initial={{ opacity: 0.8 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Dialog.DialogClose asChild>
                      <MotionButtonBase
                        className="absolute right-0 top-0 z-[9] p-8"
                        onClick={() => {
                          setOpen(false)
                        }}
                      >
                        <CloseIcon />
                      </MotionButtonBase>
                    </Dialog.DialogClose>

                    <HeaderDrawerContent />
                  </motion.dialog>
                </Dialog.Content>
              </>
            )}
          </AnimatePresence>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

// @ts-ignore
const LinkInternal: typeof Link = memo(({ children, ...rest }) => {
  return (
    <Link
      {...rest}
      prefetch={false}
      onClick={() => {
        jotaiStore.set(drawerOpenAtom, false)
      }}
    >
      {children}
    </Link>
  )
})

const HeaderDrawerContent = () => {
  const { config } = useHeaderConfig()

  return (
    <div className="h-[100vh] w-[90vw] space-y-4 overflow-auto pb-8 pt-14 scrollbar-none">
      {config.map((section, index) => {
        return (
          <motion.section
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              ...reboundPreset,
              delay: index * 0.08,
            }}
            key={section.path}
          >
            <LinkInternal className="block" href={section.path}>
              <span className="flex items-center space-x-2 py-2 text-[16px]">
                <i>{section.icon}</i>
                <h2>{section.title}</h2>
              </span>
            </LinkInternal>

            {section.subMenu && (
              <ul className="my-2 grid grid-cols-2 gap-2">
                {section.subMenu.map((sub) => {
                  return (
                    <li key={sub.path}>
                      <LinkInternal
                        className="inline-block p-2"
                        href={sub.path}
                      >
                        {sub.title}
                      </LinkInternal>
                    </li>
                  )
                })}
              </ul>
            )}
          </motion.section>
        )
      })}
    </div>
  )
}
