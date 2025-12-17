import React from 'react';
import { Section } from './types';

export const SYSTEM_INSTRUCTION = `
You are an expert Chromium OS developer assistant. 
You are helping a user build Chromium OS for the Acer Chromebook R11 (board name: 'cyan', architecture: Braswell).
The user is viewing a documentation guide.
Answer questions specifically about the Chromium OS build process (cros_sdk, emerge, repo, etc.), Linux commands, and the specific quirks of the Acer R11.
If the user asks about the guide content, reference the steps provided in your context.
Keep answers concise and technical but accessible.
`;

export const GUIDE_CONTENT: Section[] = [
  {
    id: 'overview',
    title: 'Overview',
    content: (
      <>
        <p className="mb-4">
          This guide details the complete process of building and deploying Chromium OS for the Acer Chromebook R11 (Braswell architecture), codenamed <strong>cyan</strong>.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
            <h4 className="text-cyan-400 font-bold mb-2">Boot Method</h4>
            <p className="text-sm text-slate-400">UEFI (Full ROM)</p>
          </div>
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
            <h4 className="text-cyan-400 font-bold mb-2">AI Integration</h4>
            <p className="text-sm text-slate-400">Custom Gemini CLI with Voice/UI</p>
          </div>
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
            <h4 className="text-cyan-400 font-bold mb-2">Android Support</h4>
            <p className="text-sm text-slate-400">ARC++ vs. Containers Analysis</p>
          </div>
        </div>
      </>
    )
  },
  {
    id: 'prerequisites',
    title: '1. Prerequisites',
    content: 'Ensure your host system meets the following requirements before proceeding.',
    subSections: [
      {
        id: 'host-system',
        title: 'Host System',
        content: (
          <ul className="list-disc pl-5 space-y-2 text-slate-300">
            <li><strong>OS:</strong> Ubuntu 24.04 LTS or Debian Testing</li>
            <li><strong>Architecture:</strong> x86_64</li>
            <li><strong>RAM:</strong> 16 GB minimum (32 GB recommended)</li>
            <li><strong>Storage:</strong> 100 GB+ (SSD/NVMe highly recommended)</li>
            <li><strong>CPU:</strong> 8-core recommended for reasonable compile times</li>
          </ul>
        )
      },
      {
        id: 'dependencies',
        title: 'Software Dependencies',
        content: 'Ensure basic build tools are available.',
        codeBlocks: [
          {
            language: 'bash',
            code: 'sudo apt update && sudo apt install git python3 curl',
            description: 'Install essential packages'
          }
        ]
      }
    ]
  },
  {
    id: 'env-setup',
    title: '2. Environment Setup',
    content: 'Prepare the development environment by installing Google\'s depot_tools and fetching the source code.',
    codeBlocks: [
      {
        language: 'bash',
        code: `git clone https://chromium.googlesource.com/chromium/tools/depot_tools.git
export PATH=$PWD/depot_tools:$PATH`,
        description: 'Install depot_tools'
      },
      {
        language: 'bash',
        code: `mkdir -p ~/chromiumos
cd ~/chromiumos

# Initialize repo (optionally specify a branch like -b release-R119-15633.B)
repo init -u https://chromium.googlesource.com/chromiumos/manifest.git --repo-url https://chromium.googlesource.com/external/repo.git

# Sync source code (this will take a long time)
repo sync -j8`,
        description: 'Initialize and sync source code'
      }
    ]
  },
  {
    id: 'build-config',
    title: '3. Build Configuration',
    content: 'Configure the build environment specifically for the cyan board.',
    codeBlocks: [
      {
        language: 'bash',
        code: `cros_sdk
setup_board --board=cyan`,
        description: 'Enter Chroot and setup board'
      },
      {
        language: 'bash',
        code: `sudo nano /build/cyan/etc/make.conf
# Add the following line to accept licenses:
ACCEPT_LICENSE="*"`,
        description: 'License Management (Crucial for Broadcom Wi-Fi)'
      }
    ]
  },
  {
    id: 'compilation',
    title: '4. Compilation',
    content: 'Compile the kernel, userland, and Chrome browser. This process can take several hours depending on your hardware.',
    codeBlocks: [
      {
        language: 'bash',
        code: './build_packages --board=cyan --usepkg --withdev',
        description: 'Build packages'
      }
    ]
  },
  {
    id: 'kernel-build',
    title: '5. Kernel Build (Optional)',
    content: (
      <>
        <p className="mb-2">
          Instructions for building and customizing the Linux kernel specifically for the Cyan board. This is useful for driver development or enabling specific kernel features.
        </p>
        <p className="text-slate-300">
           The process involves enabling local modification via <code>cros_workon</code>, configuring the kernel, and deploying it to a live device using the <code>update_kernel.sh</code> script.
        </p>
      </>
    ),
    codeBlocks: [
      {
        language: 'bash',
        code: `cros_workon --board=cyan start sys-kernel/chromeos-kernel-3_18`,
        description: 'Start workon for the kernel (allows local modifications)'
      },
      {
        language: 'bash',
        code: `edit_kernel_config --board=cyan`,
        description: 'Configure Kernel (Standard Method)'
      },
      {
        language: 'bash',
        code: `emerge-cyan sys-kernel/chromeos-kernel-3_18`,
        description: 'Build only the kernel'
      },
      {
        language: 'bash',
        code: `update_kernel.sh --board=cyan --remote=<device_ip>`,
        description: 'Deploy kernel to running device (optional)'
      }
    ],
    subSections: [
      {
        id: 'manual-config',
        title: 'Manual Source Configuration',
        content: (
          <>
             <p className="mb-2 text-slate-300">
               While <code>edit_kernel_config</code> is the preferred wrapper, you can navigate directly to the kernel source directory to use standard Linux configuration tools like menuconfig or xconfig.
             </p>
             <p className="mb-2 text-slate-300">
               After running <code>cros_workon start</code>, the source is active at <code>~/chromiumos/src/third_party/kernel/v3.18</code>.
             </p>
          </>
        ),
        codeBlocks: [
          {
            language: 'bash',
            code: `cd ~/chromiumos/src/third_party/kernel/v3.18
# Standard ncurses-based config
make menuconfig

# QT-based GUI config (requires X11 forwarding if on remote)
make xconfig`,
            description: 'Direct Source Configuration'
          }
        ]
      },
      {
        id: 'common-tweaks',
        title: 'Common Acer R11 Tweaks',
        content: (
           <ul className="list-disc pl-5 space-y-2 text-slate-300">
             <li><strong>Elan Touchscreen:</strong> Ensure <code>CONFIG_TOUCHSCREEN_ELAN</code> is set to 'y' or 'm' in <i>Device Drivers &gt; Input device support &gt; Touchscreens</i> to fix ghost touch issues.</li>
             <li><strong>Braswell Power Management:</strong> Verify <code>CONFIG_INTEL_IDLE</code> and P-state drivers under <i>Processor type and features</i> to maximize battery life on the N3150/N3060 CPU.</li>
             <li><strong>Container Support:</strong> Enable <code>CONFIG_CGROUPS</code> and related namespaces if planning to run custom containers outside of the standard ARC++ environment.</li>
           </ul>
        )
      }
    ]
  },
  {
    id: 'image-creation',
    title: '6. Image Creation',
    content: 'Generate the disk image capable of booting on the device.',
    codeBlocks: [
      {
        language: 'bash',
        code: './build_image --board=cyan --no-enable-rootfs-verification base',
        description: 'Create base image (disable rootfs verification for easier modding)'
      }
    ]
  },
  {
    id: 'flashing',
    title: '7. Flashing to USB',
    content: 'Write the generated image to a USB drive.',
    codeBlocks: [
      {
        language: 'bash',
        code: 'cros flash usb:// --board=cyan',
        description: 'Automatic flashing via cros tool'
      },
      {
        language: 'bash',
        code: `sudo dd if=chromiumos_image.bin of=/dev/sdX bs=4M status=progress
sync`,
        description: 'Manual flashing (alternative)'
      }
    ]
  },
  {
    id: 'device-prep',
    title: '8. Device Preparation',
    content: 'Prepare the Acer R11 hardware for custom firmware.',
    subSections: [
      {
        id: 'write-protection',
        title: 'Disable Write Protection',
        content: (
          <ol className="list-decimal pl-5 space-y-2 text-slate-300">
            <li>Power off the device.</li>
            <li>Remove the bottom cover and disconnect the battery.</li>
            <li>Remove the WP screw (bridging split-copper pad).</li>
            <li>Reassemble the device.</li>
          </ol>
        )
      },
      {
        id: 'dev-mode',
        title: 'Enable Developer Mode',
        content: 'Press Esc + Refresh + Power, then Ctrl + D at the recovery screen.'
      },
      {
        id: 'firmware',
        title: 'Update Firmware (UEFI)',
        content: 'Open Crosh (Ctrl + Alt + T), type shell, and run the MrChromebox script.',
        codeBlocks: [
          {
            language: 'bash',
            code: 'cd; curl -LOf https://mrchromebox.tech/firmware-util.sh && sudo bash firmware-util.sh',
            description: 'Run Firmware Utility Script (Select Option 2: UEFI Full ROM)'
          }
        ]
      }
    ]
  },
  {
    id: 'installation',
    title: '9. Installation',
    content: 'Boot from USB and install to internal storage.',
    codeBlocks: [
      {
        language: 'bash',
        code: '/usr/sbin/chromeos-install --dst /dev/mmcblk0',
        description: 'Install to internal eMMC (run from USB live session)'
      }
    ]
  },
  {
    id: 'post-install',
    title: '10. Post-Install Configuration',
    content: 'Configure API keys and verify hardware drivers.',
    codeBlocks: [
      {
        language: 'bash',
        code: `sudo nano /etc/chrome_dev.conf

# Append the following:
GOOGLE_API_KEY="your_api_key"
GOOGLE_DEFAULT_CLIENT_ID="your_client_id"
GOOGLE_DEFAULT_CLIENT_SECRET="your_client_secret"`,
        description: 'Add Google API Keys'
      }
    ]
  },
  {
    id: 'advanced',
    title: '11. Advanced Customization',
    content: 'Integrate Gemini AI and Android support.',
    subSections: [
      {
        id: 'gemini-integration',
        title: 'Gemini AI Integration',
        content: (
          <>
            <p className="mb-4 text-slate-300">
              To integrate a local AI assistant, you'll create a custom package within your overlay. This example uses a Python Flask server acting as the UI backend, interfacing with the Gemini API.
            </p>
            <h4 className="text-cyan-400 font-bold mb-2 text-sm">1. Package Structure</h4>
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 mb-4 font-mono text-xs text-slate-400">
              src/overlays/overlay-cyan-custom/chromeos-base/gemini-assistant/<br/>
              ├── files/<br/>
              │&nbsp;&nbsp;&nbsp;├── main.py<br/>
              │&nbsp;&nbsp;&nbsp;└── gemini-assistant.conf<br/>
              └── gemini-assistant-0.0.1.ebuild
            </div>
          </>
        ),
        codeBlocks: [
          {
            language: 'python',
            description: 'files/main.py (Flask Backend)',
            code: `from flask import Flask, request, jsonify
import google.generativeai as genai
import os

app = Flask(__name__)

# API Key injected via /etc/init/gemini-assistant.conf
genai.configure(api_key=os.environ.get("GOOGLE_API_KEY"))

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    model = genai.GenerativeModel('gemini-2.5-flash')
    response = model.generate_content(data.get('message', ''))
    return jsonify({"reply": response.text})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)`
          },
          {
            language: 'bash',
            description: 'gemini-assistant-0.0.1.ebuild',
            code: `EAPI=7
CROS_WORKON_PROJECT="overlay-cyan-custom/chromeos-base/gemini-assistant"
CROS_WORKON_LOCALNAME="gemini-assistant"

inherit cros-workon user

DESCRIPTION="Gemini AI Integration Service"
LICENSE="BSD-Google"
SLOT="0"
KEYWORDS="~*"

RDEPEND="
    dev-python/flask
    dev-python/google-generativeai
"

src_install() {
    insinto /usr/local/bin
    newins files/main.py gemini_service.py
    fperms +x /usr/local/bin/gemini_service.py

    insinto /etc/init
    doins files/gemini-assistant.conf
}`
          }
        ]
      },
      {
        id: 'android-arc',
        title: 'Android Apps (ARC++)',
        content: 'Enable native Android app support using internal manifests or private overlays.',
        codeBlocks: [
          {
            language: 'bash',
            code: './build_packages --board=cyan --with-android',
            description: 'Build with Android container support'
          }
        ]
      }
    ]
  }
];